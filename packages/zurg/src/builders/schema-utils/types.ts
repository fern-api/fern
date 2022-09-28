import { Schema } from "../../Schema";

export const OPTIONAL_BRAND = undefined as unknown as { _isOptional: void };

export type OptionalSchema<Raw, Parsed> = Schema<Raw | null | undefined, Parsed | undefined> & {
    _isOptional: void;
};
