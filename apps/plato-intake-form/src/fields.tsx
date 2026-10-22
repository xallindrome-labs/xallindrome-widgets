import { useMemo, useRef, useState, type CSSProperties } from "react";
import type {
  FieldDef,
  FieldValue,
  IntakeData,
  IntakeMode,
  SectionDef,
  UploadedFile
} from "./types";

export function isFieldVisible(field: FieldDef, data: IntakeData, mode: IntakeMode | null): boolean {
  if (mode === "minimum" && field.fullOnly) return false;
  if (field.condIf) {
    const v = data[field.condIf.field];
    if (field.condIf.contains) {
      if (!Array.isArray(v) || !(v as string[]).includes(field.condIf.contains)) return false;
    }
    if (field.condIf.equalsAnyOf) {
      if (typeof v !== "string" || !field.condIf.equalsAnyOf.includes(v)) return false;
    }
  }
  return true;
}

export function isFieldComplete(field: Pick<FieldDef, "id" | "type">, data: IntakeData): boolean {
  const v = data[field.id];
  if (field.type === "multi" || field.type === "checkbox-group") {
    return Array.isArray(v) && v.length > 0;
  }
  if (field.type === "file" || field.type === "colors" || field.type === "fonts") {
    return Array.isArray(v) && v.length > 0;
  }
  return v !== undefined && v !== null && String(v).trim() !== "";
}

export interface SectionStatus {
  requiredTotal: number;
  requiredDone: number;
  allTotal: number;
  allDone: number;
  isComplete: boolean;
}

export function sectionStatus(
  section: SectionDef,
  data: IntakeData,
  mode: IntakeMode | null
): SectionStatus {
  const visible = section.fields.filter((f) => isFieldVisible(f, data, mode));
  const required = visible.filter((f) => f.required);
  const requiredDone = required.filter((f) => isFieldComplete(f, data)).length;
  const allDone = visible.filter((f) => isFieldComplete(f, data)).length;
  return {
    requiredTotal: required.length,
    requiredDone,
    allTotal: visible.length,
    allDone,
    isComplete: required.length > 0 ? requiredDone === required.length : allDone > 0
  };
}

/* ---------- atoms ---------- */

interface TextInputProps {
  value: FieldValue;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

function TextInput({ value, onChange, placeholder, type = "text" }: TextInputProps) {
  return (
    <input
      className="input"
      type={type}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Type your answer."}
    />
  );
}

function LongText({ value, onChange, placeholder }: TextInputProps) {
  return (
    <textarea
      className="input"
      rows={4}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Be specific. We'd rather have too much than too little."}
    />
  );
}

interface SelectProps {
  value: FieldValue;
  onChange: (v: string) => void;
  options: string[];
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      className="select"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select an option…
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

interface ChipsProps {
  value: FieldValue;
  onChange: (v: string[]) => void;
  options: string[];
}

function Chips({ value, onChange, options }: ChipsProps) {
  const arr = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (o: string) => {
    if (arr.includes(o)) onChange(arr.filter((x) => x !== o));
    else onChange([...arr, o]);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          className={`chip ${arr.includes(o) ? "on" : ""}`}
          onClick={() => toggle(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function CheckGroup({ value, onChange, options }: ChipsProps) {
  const arr = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (o: string) => {
    if (arr.includes(o)) onChange(arr.filter((x) => x !== o));
    else onChange([...arr, o]);
  };
  return (
    <div className="check-list" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {options.map((o) => (
        <div key={o} className="checkbox-row" onClick={() => toggle(o)}>
          <span className={`check ${arr.includes(o) ? "on" : ""}`}></span>
          <span className="check-lbl">{o}</span>
        </div>
      ))}
    </div>
  );
}

interface FileFieldProps {
  value: FieldValue;
  onChange: (v: UploadedFile[]) => void;
  label?: string;
}

function FileField({ value, onChange, label }: FileFieldProps) {
  const arr = Array.isArray(value) ? (value as UploadedFile[]) : [];
  const ref = useRef<HTMLInputElement | null>(null);

  const onFiles = (files: FileList | null) => {
    const list: UploadedFile[] = Array.from(files ?? []).map((f) => ({
      name: f.name,
      size: f.size
    }));
    onChange([...arr, ...list]);
  };

  return (
    <div>
      <div className="file-drop" onClick={() => ref.current?.click()}>
        <div className="left">
          <span className="icon">↑</span>
          <span className="label">
            {label ?? "Click to upload"}
            <span className="sub">SVG, PNG, JPG, MP4, PDF — up to 200MB per file</span>
          </span>
        </div>
        <span className="meta">UPLOAD</span>
        <input
          ref={ref}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
      {arr.length > 0 && (
        <div className="file-list" style={{ marginTop: 12 }}>
          {arr.map((f, i) => (
            <div className="file-row" key={i}>
              <span>
                {f.name}{" "}
                <span className="x-faint" style={{ marginLeft: 8 }}>
                  {Math.round((f.size || 0) / 1024)} KB
                </span>
              </span>
              <span className="x" onClick={() => onChange(arr.filter((_, idx) => idx !== i))}>
                ✕
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DateTimeProps {
  value: FieldValue;
  onChange: (v: string) => void;
}

function DateTime({ value, onChange }: DateTimeProps) {
  return (
    <input
      type="datetime-local"
      className="input"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ colorScheme: "dark" }}
    />
  );
}

/* ---------- color picker (up to 5) ---------- */

interface ColorPickerProps {
  value: FieldValue;
  onChange: (v: string[]) => void;
  max?: number;
}

function ColorPicker({ value, onChange, max = 5 }: ColorPickerProps) {
  const arr = Array.isArray(value) ? (value as string[]) : [];
  const [draft, setDraft] = useState("#E50914");

  const add = () => {
    if (arr.length >= max) return;
    const hex = (draft || "").trim();
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    if (arr.includes(hex.toUpperCase())) return;
    onChange([...arr, hex.toUpperCase()]);
  };
  const remove = (i: number) => onChange(arr.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label
          style={{
            width: 56,
            height: 56,
            border: "1px solid var(--ground-400)",
            background: draft,
            cursor: "pointer",
            position: "relative",
            flexShrink: 0
          }}
        >
          <input
            type="color"
            value={draft}
            onChange={(e) => setDraft(e.target.value.toUpperCase())}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          placeholder="#000000"
          style={{ maxWidth: 140, fontFamily: "var(--font-mono)" }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={add}
          disabled={arr.length >= max}
          style={{ padding: "8px 16px" }}
        >
          Add color <span className="x-arrow">+</span>
        </button>
        <span className="x-nano" style={{ marginLeft: "auto" }}>
          {arr.length} / {max}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: max }).map((_, i) => {
          const c = arr[i];
          if (!c) {
            return (
              <div
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  border: "1px dashed var(--ground-400)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-4)"
                }}
              >
                0{i + 1}
              </div>
            );
          }
          return (
            <div key={i} style={{ position: "relative", width: 64 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: c,
                  border: "1px solid var(--ground-400)"
                }}
              ></div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: "var(--fg-3)",
                  marginTop: 6,
                  textAlign: "center"
                }}
              >
                {c}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                title="Remove"
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  width: 18,
                  height: 18,
                  border: "1px solid var(--ground-400)",
                  background: "var(--bg-1)",
                  color: "var(--fg-3)",
                  cursor: "pointer",
                  fontSize: 10,
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- font typeahead (addable) ---------- */

const COMMON_FONTS = [
  "Inter",
  "Helvetica",
  "Helvetica Neue",
  "Arial",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Source Serif Pro",
  "Playfair Display",
  "Merriweather",
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Baskerville",
  "Didot",
  "Bodoni",
  "Futura",
  "Avenir",
  "Avenir Next",
  "Gotham",
  "Proxima Nova",
  "Circular",
  "Graphik",
  "Söhne",
  "GT America",
  "Neue Haas Grotesk",
  "Neue Haas Unica",
  "Neue Montreal",
  "Söhne Mono",
  "JetBrains Mono",
  "Fira Code",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "IBM Plex Mono",
  "DM Sans",
  "DM Serif Display",
  "DM Mono",
  "Space Grotesk",
  "Space Mono",
  "Manrope",
  "Outfit",
  "Geist",
  "Geist Mono",
  "Cormorant",
  "Cormorant Garamond",
  "EB Garamond",
  "Libre Baskerville",
  "Lora",
  "Karla",
  "Work Sans",
  "Nunito",
  "Nunito Sans",
  "Raleway",
  "Quicksand",
  "Rubik",
  "Mulish",
  "Public Sans",
  "Plus Jakarta Sans",
  "Sora",
  "Bricolage Grotesque",
  "Instrument Serif",
  "Fraunces"
];

interface FontTypeaheadProps {
  value: FieldValue;
  onChange: (v: string[]) => void;
}

function FontTypeahead({ value, onChange }: FontTypeaheadProps) {
  const arr = Array.isArray(value) ? (value as string[]) : [];
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return [];
    return COMMON_FONTS.filter((f) => f.toLowerCase().includes(q) && !arr.includes(f)).slice(0, 6);
  }, [draft, arr]);

  const add = (name?: string) => {
    const v = (name ?? draft).trim();
    if (!v || arr.includes(v)) {
      setDraft("");
      setOpen(false);
      return;
    }
    onChange([...arr, v]);
    setDraft("");
    setOpen(false);
  };
  const remove = (i: number) => onChange(arr.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative" }}>
        <input
          className="input"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
            if (e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Start typing a font name…"
        />
        {open && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "var(--bg-2)",
              border: "1px solid var(--line-1)",
              zIndex: 5,
              maxHeight: 240,
              overflowY: "auto"
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s);
                }}
                style={{
                  padding: "10px 14px",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--fg-2)",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--ground-200)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontFamily: `"${s}", var(--font-body)` }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {arr.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {arr.map((f, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                border: "1px solid var(--ground-400)",
                background: "var(--bg-2)"
              }}
            >
              <span
                style={{
                  fontFamily: `"${f}", var(--font-body)`,
                  fontSize: 14,
                  color: "var(--fg-1)"
                }}
              >
                {f}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "var(--fg-4)",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 12
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <span className="x-nano">Press Enter or comma to add. Click a suggestion to autocomplete.</span>
    </div>
  );
}

/* ---------- field renderer ---------- */

interface FieldProps {
  field: FieldDef;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  idx: number;
}

export function Field({ field, value, onChange, idx }: FieldProps) {
  let control: React.ReactNode = null;

  switch (field.type) {
    case "text":
      control = <TextInput value={value} onChange={onChange} />;
      break;
    case "url":
      control = <TextInput value={value} onChange={onChange} type="url" placeholder="https://" />;
      break;
    case "email":
      control = <TextInput value={value} onChange={onChange} type="email" placeholder="name@domain.com" />;
      break;
    case "phone":
      control = <TextInput value={value} onChange={onChange} type="tel" placeholder="+1 (555) 555-5555" />;
      break;
    case "longtext":
      control = <LongText value={value} onChange={onChange} />;
      break;
    case "select":
      control = <Select value={value} onChange={onChange} options={field.options ?? []} />;
      break;
    case "multi":
      control = <Chips value={value} onChange={onChange} options={field.options ?? []} />;
      break;
    case "checkbox-group":
      control = <CheckGroup value={value} onChange={onChange} options={field.options ?? []} />;
      break;
    case "file":
      control = <FileField value={value} onChange={onChange} label={field.help ?? "Click to upload"} />;
      break;
    case "colors":
      control = <ColorPicker value={value} onChange={onChange} />;
      break;
    case "fonts":
      control = <FontTypeahead value={value} onChange={onChange} />;
      break;
    case "datetime":
      control = <DateTime value={value} onChange={onChange} />;
      break;
    default:
      control = <TextInput value={value} onChange={onChange} />;
  }

  const showFlag = field.id === "noFlyTopics" && typeof value === "string" && value.trim() !== "";

  return (
    <div className="field" style={{ "--pif-i": Math.min(idx - 1, 8) } as CSSProperties}>
      <div className="ref-col">
        <span className="ref">Q.{String(idx).padStart(2, "0")}</span>
        <span className={field.required ? "req" : "opt"}>{field.required ? "Required" : "Optional"}</span>
      </div>
      <div className="body-col">
        <label className="q">{field.q}</label>
        {field.help && <p className="help">{field.help}</p>}
        {control}
        {showFlag && <span className="flag">⚑ Hard-no list — locked into our scripting brief</span>}
      </div>
    </div>
  );
}
