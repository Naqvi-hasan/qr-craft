"use client";

import Icon from "../../Icon";

// One generic field renderer. Each QR type only describes its fields as data
// (name, label, type, variant...) and this component decides how to draw them.

const boxClass =
  "w-full rounded-xl border bg-surface px-3.5 py-3 text-sm text-text placeholder:text-subtle outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

function Label({ field, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-text">
      {field.label}
      {field.required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

// Button group for selects with few options (e.g. "Address | Coordinates").
function Segmented({ field, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-text">{field.label}</span>
      <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface-2 p-1">
        {field.options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(field.name, opt.value)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-brand-gradient text-on-primary shadow-card" : "text-muted hover:bg-surface hover:text-text"
              }`}
            >
              {opt.icon && <Icon name={opt.icon} size={16} />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FormField({ field, value, error, onChange, onBlur }) {
  const id = `field-${field.name}`;
  const errorId = error ? `${id}-error` : undefined;
  const borderClass = error ? "border-danger" : "border-line";

  if (field.type === "select" && field.variant === "segmented") {
    return <Segmented field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="h-4 w-4 rounded accent-primary"
        />
        {field.label}
      </label>
    );
  }

  const common = {
    id,
    name: field.name,
    value: value ?? "",
    onChange: (e) => onChange(field.name, e.target.value),
    onBlur: () => onBlur(field.name),
    "aria-invalid": Boolean(error),
    "aria-describedby": errorId,
  };

  let control;
  if (field.type === "textarea") {
    control = <textarea {...common} rows={4} placeholder={field.placeholder} maxLength={field.maxLength} className={`${boxClass} ${borderClass} resize-y`} />;
  } else if (field.type === "select") {
    control = (
      <div className="relative">
        <select {...common} className={`${boxClass} ${borderClass} cursor-pointer appearance-none pr-10`}>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle" />
      </div>
    );
  } else {
    const hasValue = String(value ?? "") !== "";
    control = (
      <div className="relative">
        <input
          {...common}
          type={field.type === "number" ? "text" : field.type}
          inputMode={field.type === "number" ? "decimal" : undefined}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          autoComplete={field.type === "password" ? "new-password" : "off"}
          className={`${boxClass} ${borderClass} pr-10`}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onChange(field.name, "")}
            aria-label={`Clear ${field.label}`}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-subtle transition hover:bg-surface-2 hover:text-text"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
    );
  }

  const showCounter = field.type === "textarea" && field.maxLength;
  const showFooter = error || field.help || showCounter;

  return (
    <div className="flex flex-col gap-2">
      <Label field={field} htmlFor={id} />
      {control}
      {showFooter && (
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p id={errorId} className="flex items-center gap-1 text-xs font-medium text-danger">
            <Icon name="alert" size={14} />
            {error}
          </p>
        ) : field.help ? (
          <p className="text-xs text-subtle">{field.help}</p>
        ) : (
          <span />
        )}
        {showCounter && (
          <p className="shrink-0 text-xs text-subtle">
            {String(value ?? "").length}/{field.maxLength}
          </p>
        )}
      </div>
      )}
    </div>
  );
}
