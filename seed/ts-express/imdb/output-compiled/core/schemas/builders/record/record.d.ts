import { type Schema } from "../../Schema";
import type { RecordSchema } from "./types";
export declare function record<RawKey extends string | number, RawValue, ParsedValue, ParsedKey extends string | number>(keySchema: Schema<RawKey, ParsedKey>, valueSchema: Schema<RawValue, ParsedValue>): RecordSchema<RawKey, RawValue, ParsedKey, ParsedValue>;
