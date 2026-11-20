import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { STATEMENT_THEMES } from '../../../../../types/cms-statement.interface';
import type { StatementFormValue } from '../../../../admin-page.interfaces';

const MIN_TEXT_LENGTH = 10;
const MAX_TITLE_LENGTH = 100;
const MAX_ARGUMENTS = 10;

interface StatementFormControls {
  readonly title: FormControl<string>
  readonly theme: FormControl<string>
  readonly text: FormControl<string>
  readonly explanation: FormControl<string>
  readonly consequence: FormControl<string>
  readonly argumentsFor: FormControl<string>
  readonly argumentsAgainst: FormControl<string>
  readonly isActive: FormControl<boolean>
}

function toNullIfEmpty(value: string): string | null {
  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}

// Argumenten worden als één tekstvak met één argument per regel bewerkt.
function toArgumentList(value: string): string[] {
  return value.split('\n').map(line => line.trim()).filter(line => line !== '');
}

function maxArgumentLines(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && toArgumentList(control.value).length > MAX_ARGUMENTS ? { maxArguments: true } : null;
}

@Component({
  selector: 'stw-statement-form',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './statement-form.component.html',
  styleUrl: './statement-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementFormComponent {
  public readonly initialValue = input<StatementFormValue | null>(null);

  public readonly loading = input(false);

  public readonly submitForm = output<StatementFormValue>();

  public readonly cancelled = output();

  protected readonly themes = STATEMENT_THEMES;

  protected readonly maxArguments = MAX_ARGUMENTS;

  protected readonly form = new FormGroup<StatementFormControls>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(MAX_TITLE_LENGTH)] }),
    theme: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(MAX_TITLE_LENGTH)] }),
    text: new FormControl('', {
      nonNullable: true,
      validators: [
        (control: AbstractControl): ValidationErrors | null => Validators.required(control),
        Validators.minLength(MIN_TEXT_LENGTH),
      ],
    }),
    explanation: new FormControl('', { nonNullable: true }),
    consequence: new FormControl('', { nonNullable: true }),
    argumentsFor: new FormControl('', { nonNullable: true, validators: [maxArgumentLines] }),
    argumentsAgainst: new FormControl('', { nonNullable: true, validators: [maxArgumentLines] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  public constructor() {
    effect(() => {
      const value = this.initialValue();

      if (value !== null) {
        this.form.setValue({
          title: value.title ?? '',
          theme: value.theme ?? '',
          text: value.text,
          explanation: value.explanation ?? '',
          consequence: value.consequence ?? '',
          argumentsFor: value.argumentsFor.join('\n'),
          argumentsAgainst: value.argumentsAgainst.join('\n'),
          isActive: value.isActive,
        });
      }
    });
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected textErrorMessage(): string {
    const control = this.form.controls.text;

    if (control.hasError('required')) {
      return 'De stellingtekst is verplicht.';
    }

    if (control.hasError('minlength')) {
      return `De stellingtekst moet minimaal ${MIN_TEXT_LENGTH} tekens bevatten.`;
    }

    return '';
  }

  protected handleSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();

      return;
    }

    const raw = this.form.getRawValue();

    this.submitForm.emit({
      title: toNullIfEmpty(raw.title),
      theme: toNullIfEmpty(raw.theme),
      text: raw.text.trim(),
      explanation: toNullIfEmpty(raw.explanation),
      consequence: toNullIfEmpty(raw.consequence),
      argumentsFor: toArgumentList(raw.argumentsFor),
      argumentsAgainst: toArgumentList(raw.argumentsAgainst),
      isActive: raw.isActive,
    });
  }
}

