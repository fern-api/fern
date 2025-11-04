import type { ErrorCategory } from "./ErrorCategory.js";
import type { ErrorCode } from "./ErrorCode.js";
export interface Error_ {
    category: ErrorCategory;
    code: ErrorCode;
    detail?: string;
    field?: string;
}
