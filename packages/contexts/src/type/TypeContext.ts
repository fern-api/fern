import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTypeContextMixin } from "./TypeContextMixin";

export interface TypeContext extends WithBaseContextMixin, WithTypeContextMixin {}
