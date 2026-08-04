import { useState } from "react";
import type { InputHTMLAttributes } from "react";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  type?: "text" | "email" | "password";
}

export function TextInput({ label, type = "text", id, ...rest }: TextInputProps) {
  const [reveal, setReveal] = useState(false);
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <label
        htmlFor={inputId}
        style={{ fontFamily: "var(--font-family-base)", fontWeight: 500, fontSize: 14, color: "var(--color-bluegray-900)" }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          {...rest}
          id={inputId}
          type={isPassword && !reveal ? "password" : "text"}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid var(--color-border-base)",
            fontFamily: "var(--font-family-base)",
            fontSize: 16,
          }}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={reveal ? "Hide password" : "Show password"}
            onClick={() => setReveal((r) => !r)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
          >
            {reveal ? "🙈" : "👁"}
          </button>
        )}
      </div>
    </div>
  );
}
