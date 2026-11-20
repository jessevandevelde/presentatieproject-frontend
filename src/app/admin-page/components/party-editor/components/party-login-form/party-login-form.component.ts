import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { PasswordToggleComponent } from '../../../../../components/password-toggle/password-toggle.component';
import type { PartyAdminAccount, PartyLoginFormValue } from '../../../../admin-page.interfaces';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 255;

interface PartyLoginControls {
  readonly name: FormControl<string>
  readonly email: FormControl<string>
  readonly password: FormControl<string>
}

function required(control: AbstractControl): ValidationErrors | null {
  return Validators.required(control);
}

function email(control: AbstractControl): ValidationErrors | null {
  return Validators.email(control);
}

// Formulier voor een nieuw of bestaand partijbeheerdersaccount; bij een bestaand account is het wachtwoord optioneel.
@Component({
  selector: 'stw-party-login-form',
  imports: [ReactiveFormsModule, ButtonComponent, PasswordToggleComponent],
  templateUrl: './party-login-form.component.html',
  styleUrl: './party-login-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyLoginFormComponent {
  public readonly account = input<PartyAdminAccount | null>(null);

  public readonly idPrefix = input.required<string>();

  public readonly saving = input(false);

  public readonly submitLogin = output<PartyLoginFormValue>();

  public readonly cancelled = output();

  protected readonly passwordVisible = signal(false);

  protected readonly form = new FormGroup<PartyLoginControls>({
    name: new FormControl('', { nonNullable: true, validators: [required, Validators.maxLength(MAX_NAME_LENGTH)] }),
    email: new FormControl('', { nonNullable: true, validators: [required, email, Validators.maxLength(MAX_EMAIL_LENGTH)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)] }),
  });

  public constructor() {
    effect(() => {
      const account = this.account();
      const { password } = this.form.controls;

      if (account === null) {
        password.addValidators(required);
      }
      else {
        this.form.reset({ name: account.name, email: account.email, password: '' });
        password.removeValidators(required);
      }

      password.updateValueAndValidity();
    });
  }

  protected isFieldInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected passwordPlaceholder(): string {
    return this.account() === null ? 'Minimaal 8 tekens' : 'Leeg laten om het huidige wachtwoord te houden';
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  protected handleSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();

      return;
    }

    const raw = this.form.getRawValue();

    this.submitLogin.emit({ name: raw.name.trim(), email: raw.email.trim(), password: raw.password === '' ? null : raw.password });
  }
}

