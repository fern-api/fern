import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithRequestWrapperContextMixin } from "./RequestWrapperContextMixin";

export interface RequestWrapperContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithRequestWrapperContextMixin {}
