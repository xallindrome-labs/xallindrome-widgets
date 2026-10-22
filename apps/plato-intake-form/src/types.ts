export type IntakeMode = "minimum" | "full";

export type FieldType =
  | "text"
  | "url"
  | "email"
  | "phone"
  | "longtext"
  | "select"
  | "multi"
  | "checkbox-group"
  | "file"
  | "colors"
  | "fonts"
  | "datetime";

export type MapsTo = "workspace" | "crm";

export interface FieldCondition {
  field: string;
  contains?: string;
  equalsAnyOf?: string[];
}

export interface FieldDef {
  id: string;
  q: string;
  help?: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  fullOnly?: boolean;
  condIf?: FieldCondition;
  mapsTo?: MapsTo[];
}

export interface SectionDef {
  id: string;
  ref: string;
  name: string;
  desc: string;
  fullOnly?: boolean;
  fields: FieldDef[];
}

export interface UploadedFile {
  name: string;
  size: number;
}

export type FieldValue =
  | string
  | string[]
  | UploadedFile[]
  | undefined
  | null;

export interface IntakeData {
  [fieldId: string]: FieldValue;
}

export interface IntakeState {
  mode: IntakeMode | null;
  stepIdx: number;
  data: IntakeData;
}

export interface IntakeSubmitPayload {
  mode: IntakeMode;
  data: IntakeData;
  submittedAt: string;
  source?: string;
  turnstileToken?: string;
}
