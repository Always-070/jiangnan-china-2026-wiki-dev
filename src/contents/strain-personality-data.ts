export type ProtocolId = "quick" | "full";
export type DimensionId = "EI" | "SN" | "TF" | "JP";
export type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type QuestionKind = "classic" | "scenario";
export type PersonalityType = `${"E" | "I"}${"S" | "N"}${"T" | "F"}${"J" | "P"}`;

export interface StrainQuestion {
  id: string;
  protocol: ProtocolId;
  dimension: DimensionId;
  pole: Pole;
  kind: QuestionKind;
  prompt: string;
  glossaryKey?: string;
}
