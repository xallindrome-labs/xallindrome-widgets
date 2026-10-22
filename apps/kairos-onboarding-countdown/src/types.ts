export interface ChecklistItem {
  /** Index label shown in the mono micro-style on the left of the row. */
  ix?: string;
  /** Body text for the row. */
  text: string;
  /** When true, the row renders as completed (struck through). */
  done?: boolean;
}

export interface ChecklistColumn {
  /** Heading shown at the top of the column. */
  title: string;
  /** Right-aligned ordinal/meta line on the heading row. */
  ord?: string;
  items: ChecklistItem[];
}
