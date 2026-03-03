import { type Schema } from "../../Schema";
import type { PartialRecordSchema, RecordSchema } from "./types";
export declare function record<RawKey extends string | number, RawValue, ParsedValue, ParsedKey extends string | number>(keySchema: Schema<RawKey, ParsedKey>, valueSchema: Schema<RawValue, ParsedValue>): RecordSchema<RawKey, RawValue, ParsedKey, ParsedValue>;
export declare function partialRecord<RawKey extends string | number, RawValue, ParsedValue, ParsedKey extends string | number>(keySchema: Schema<RawKey, ParsedKey>, valueSchema: Schema<RawValue, ParsedValue>): PartialRecordSchema<RawKey, RawValue, ParsedKey, ParsedValue>;
