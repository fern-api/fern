import type { ErrorCategory } from "./ErrorCategory.mjs";
import type { ErrorCode } from "./ErrorCode.mjs";
export interface Error_ {
    category: ErrorCategory;
    code: ErrorCode;
    detail?: string;
    field?: string;
}
