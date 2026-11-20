import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../components/button/button.component';
import { PasswordToggleComponent } from '../../../components/password-toggle/password-toggle.component';
import type { LoginCredentials } from '../../login-page.interfaces';

const MIN_PASSWORD_LENGTH = 8;

interface LoginFormControls {
  readonly email: FormControl<string>
  readonly password: FormControl<string>
  readonly rememberMe: FormControl<boolean>
}

@Component({
  selector: 'stw-login-form',
  imports: [ReactiveFormsModule, ButtonComponent, PasswordToggleComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  public readonly loading = input(false);

  public readonly submitLogin = output<LoginCredentials>();

  protected readonly passwordVisible = signal(false);

  protected readonly form = new FormGroup<LoginFormControls>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        (control: AbstractControl): ValidationErrors | null => Validators.required(control),
        (control: AbstractControl): ValidationErrors | null => Validators.email(control),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        (control: AbstractControl): ValidationErrors | null => Validators.required(control),
        Validators.minLength(MIN_PASSWORD_LENGTH),
      ],
    }),
    rememberMe: new FormControl(false, { nonNullable: true }),
  });

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  protected isFieldInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  protected emailErrorMessage(): string {
    const control = this.form.controls.email;

    if (control.hasError('required')) {
      return 'E-mailadres is verplicht.';
    }

    if (control.hasError('email')) {
      return 'Vul een geldig e-mailadres in.';
    }

    return '';
  }

  protected passwordErrorMessage(): string {
    const control = this.form.controls.password;

    if (control.hasError('required')) {
      return 'Wachtwoord is verplicht.';
    }

    if (control.hasError('minlength')) {
      return `Wachtwoord moet minimaal ${MIN_PASSWORD_LENGTH} tekens bevatten.`;
    }

    return '';
  }

  protected handleSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();

      return;
    }

    this.submitLogin.emit(this.form.getRawValue());
  }
}
