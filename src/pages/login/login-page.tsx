import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { loginSchema } from '@features/auth/model/login-schema';
import { useAuthStore } from '@features/auth/model/auth-store';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Stamp } from '@shared/ui/stamp';
import { notifySuccess } from '@shared/lib/notify';

function fieldErrorMessage(errors: unknown[]): string | undefined {
  const first = errors[0];
  if (!first) return undefined;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && first !== null && 'message' in first) {
    return String((first as { message: unknown }).message);
  }
  return undefined;
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      login(value.email);
      notifySuccess('Bem-vindo(a) de volta!');
      navigate({ to: '/search' });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Stamp variant="want">Ex Libris</Stamp>
          <h1 className="font-display text-3xl font-semibold">Libris</h1>
          <p className="text-sm text-muted-foreground">
            Login simulado — use qualquer e-mail válido e uma senha com 7+ caracteres.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="email"
            validators={{ onChange: loginSchema.shape.email }}
            children={(field) => {
              const errorMessage = fieldErrorMessage(field.state.meta.errors);
              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>E-mail</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={errorMessage ? true : undefined}
                  />
                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                </div>
              );
            }}
          />

          <form.Field
            name="password"
            validators={{ onChange: loginSchema.shape.password }}
            children={(field) => {
              const errorMessage = fieldErrorMessage(field.state.meta.errors);
              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Senha</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={errorMessage ? true : undefined}
                  />
                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                </div>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Entrar
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}
