import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Code2,
  MessageSquareText,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "../../components/shared/Brand";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

export function AuthLayout({
  mode,
  showSwitch = true,
  children,
}: {
  mode: "login" | "register" | "recovery";
  showSwitch?: boolean;
  children: ReactNode;
}) {
  const isLogin = mode === "login";
  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div className="auth-aside__top">
          <Brand />
          <span className="auth-preview-label">
            <i /> Product preview
          </span>
        </div>
        <div className="auth-aside__content">
          <div className="auth-aside__icon">
            <Braces size={22} />
          </div>
          <p className="eyebrow">Think together. Debug smarter.</p>
          <h2>
            Code is a<br />
            conversation.
          </h2>
          <p>
            Keep your people, your ideas, and the next “aha” in the same room.
          </p>
          <div className="auth-aside__mini">
            <span>
              <Code2 size={15} /> Shared editor
            </span>
            <span>
              <MessageSquareText size={15} /> Room chat
            </span>
            <span>
              <ArrowRight size={15} /> Better questions
            </span>
          </div>
        </div>
        <span className="auth-aside__footer">
          A calmer place to figure it out.
        </span>
      </section>
      <section className="auth-main">
        <header className="auth-main__nav">
          <Link to="/" className="auth-back">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <ThemeToggle />
        </header>
        <div className="auth-form-wrap">
          {children}
          {showSwitch && (
            <p className="auth-switch">
              {isLogin ? "New to Syncode?" : "Already have an account?"}{" "}
              <Link to={isLogin ? "/register" : "/login"}>
                {isLogin ? "Create an account" : "Log in"}
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
