import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { api } from "../../lib/api";
import { AuthLayout } from "./AuthLayout";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type Values = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: Values) {
    setError("");
    try {
      await api.resetPassword(token, values.password);
      navigate("/login", {
        replace: true,
        state: {
          notice: "Your password has been updated. You can now sign in.",
        },
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset your password.",
      );
    }
  }

  return (
    <AuthLayout mode="recovery">
      <div className="auth-heading">
        <span className="auth-heading__icon">
          <KeyRound size={18} />
        </span>
        <p className="eyebrow">Account recovery</p>
        <h1>
          Choose a new
          <br />
          password.
        </h1>
        <p>Use at least 8 characters.</p>
      </div>
      {!token ? (
        <p className="form-notice" role="alert">
          This reset link is incomplete.{" "}
          <Link to="/forgot-password">Request another link</Link>.
        </p>
      ) : (
        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register("password")}
            error={errors.password?.message}
          />
          <Field
            label="Confirm new password"
            type="password"
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
            {isSubmitting ? "Please wait…" : "Update password"}
          </Button>
          {error && (
            <p className="form-notice" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
