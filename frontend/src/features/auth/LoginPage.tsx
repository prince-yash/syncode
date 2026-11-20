import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { useAuth } from "../../providers/useAuth";
import { AuthLayout } from "./AuthLayout";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [notice, setNotice] = useState(
    (location.state as { notice?: string } | null)?.notice ?? "",
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setNotice("");
    try {
      await signIn(values.email, values.password);
      navigate(destination, { replace: true });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="auth-heading">
        <span className="auth-heading__icon">
          <KeyRound size={18} />
        </span>
        <p className="eyebrow">Welcome back</p>
        <h1>
          Pick up where
          <br />
          you left off.
        </h1>
        <p>Your room is better with you in it.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="field">
          <div className="field__label-row">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <Link className="text-button" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <div className="password-field">
            <input
              id="password"
              className={`field__input${errors.password ? " field__input--error" : ""}`}
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="field__error" id="password-error" role="alert">
              {errors.password.message}
            </span>
          )}
        </div>
        <Button
          type="submit"
          className="auth-submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait…" : "Continue"}{" "}
          <span aria-hidden="true">→</span>
        </Button>
        {notice && (
          <p className="form-notice" role="status">
            {notice}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
