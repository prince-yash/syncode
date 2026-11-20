import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { api } from "../../lib/api";
import { AuthLayout } from "./AuthLayout";

const schema = z.object({ email: z.email("Enter a valid email address.") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: Values) {
    setError("");
    try {
      const response = await api.forgotPassword(values.email);
      setNotice(response.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request a reset link.",
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
          Reset your
          <br />
          password.
        </h1>
        <p>We’ll send a reset link if an account matches that email.</p>
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
        <Button
          type="submit"
          className="auth-submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait…" : "Send reset link"}
        </Button>
        {notice && (
          <p className="form-notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="form-notice" role="alert">
            {error}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
