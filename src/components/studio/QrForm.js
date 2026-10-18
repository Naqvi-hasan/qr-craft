"use client";

import FormField from "./fields/FormField";
import Icon from "../Icon";
import { isFieldVisible } from "@/qr-types";

// Optional card a QR type can define as `helper` (e.g. "Open map" for Location).
function HelperCard({ helper, values }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
        <Icon name={helper.icon} size={26} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-text">{helper.title}</p>
        <p className="mt-0.5 text-xs text-muted">{helper.text}</p>
      </div>
      <a
        href={helper.href(values)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 px-3.5 py-2 text-sm font-medium text-primary-text transition hover:bg-primary-soft"
      >
        {helper.actionLabel}
        <Icon name="external" size={14} />
      </a>
    </div>
  );
}

// Renders the input form for the selected QR type, using the type's `fields` list.
// Errors are shown only for fields the user has touched, so the form doesn't start "red".
export default function QrForm({ type, values, errors, touched, onChange, onBlur, title }) {
  const visibleFields = type.fields.filter((field) => isFieldVisible(field, values));

  return (
    <div className="flex flex-col gap-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
        <Icon name={type.icon} size={20} className="text-primary-text" />
        {title ?? `Enter ${type.label} details`}
      </h2>

      {type.note && (
        <div className="flex gap-2.5 rounded-xl border border-warning/25 bg-warning-soft px-3.5 py-3 text-xs leading-relaxed text-warning">
          <Icon name="info" size={16} className="mt-px shrink-0" />
          <span>{type.note}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        {visibleFields.map((field) => (
          <div key={field.name} className={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
            <FormField
              field={field}
              value={values[field.name]}
              error={touched[field.name] ? errors[field.name] : undefined}
              onChange={onChange}
              onBlur={onBlur}
            />
          </div>
        ))}
      </div>

      {type.helper && <HelperCard helper={type.helper} values={values} />}

      {errors._form && (
        <p className="flex gap-2 rounded-xl bg-danger-soft px-3.5 py-3 text-xs font-medium text-danger">
          <Icon name="alert" size={16} className="mt-px shrink-0" />
          {errors._form}
        </p>
      )}

      {type.tip && (
        <p className="flex gap-2 rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs text-primary-text">
          <Icon name="info" size={16} className="mt-px shrink-0" />
          {type.tip}
        </p>
      )}
    </div>
  );
}
