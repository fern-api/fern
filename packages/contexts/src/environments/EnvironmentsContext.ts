import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithEnvironmentsContextMixin } from "./EnvironmentsContextMixin";

export interface EnvironmentsContext extends WithBaseContextMixin, WithEnvironmentsContextMixin {}
