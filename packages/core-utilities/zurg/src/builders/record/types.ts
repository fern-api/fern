import { BaseSchema } from "../../Schema";
import { OptionalRecord } from "../../utils/OptionalRecord";
import { SchemaUtils } from "../schema-utils";

export type RecordSchema<
    RawKey extends string | number,
    RawValue,
    ParsedKey extends string | number,
    ParsedValue
> = BaseRecordSchema<RawKey, RawValue, ParsedKey, ParsedValue> &
    SchemaUtils<OptionalRecord<RawKey, RawValue>, OptionalRecord<ParsedKey, ParsedValue>>;

export type BaseRecordSchema<
    RawKey extends string | number,
    RawValue,
    ParsedKey extends string | number,
    ParsedValue
> = BaseSchema<OptionalRecord<RawKey, RawValue>, OptionalRecord<ParsedKey, ParsedValue>>;
