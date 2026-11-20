import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { useAuth } from "../../providers/useAuth";
import { AuthLayout } from "./AuthLayout";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter at least 2 characters."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setNotice("");
    try {
      await signUp({
        displayName: values.name,
        email: values.email,
        password: values.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    }
  }

  return (
    <AuthLayout mode="register">
      <div className="auth-heading">
        <span className="auth-heading__icon">
          <UserRoundPlus size={18} />
        </span>
        <p className="eyebrow">Make space for good ideas</p>
        <h1>
          Build better
          <br />
          with your people.
        </h1>
        <p>Create your Syncode account to get started.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label="Your name"
          autoComplete="name"
          placeholder="Alex Rivera"
          {...register("name")}
          error={errors.name?.message}
        />
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="field">
          <label className="field__label" htmlFor="register-password">
            Password
          </label>
          <div className="password-field">
            <input
              id="register-password"
              className={`field__input${errors.password ? " field__input--error" : ""}`}
              type={passwordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
              }
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
            <span
              className="field__error"
              id="register-password-error"
              role="alert"
            >
              {errors.password.message}
            </span>
          )}
        </div>
        <Field
          label="Confirm password"
          type={passwordVisible ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <Button
          type="submit"
          className="auth-submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait…" : "Create account"}{" "}
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
