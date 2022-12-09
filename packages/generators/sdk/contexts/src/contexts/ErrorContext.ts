import { WithBaseContextMixin, WithErrorContextMixin, WithTypeContextMixin } from "./mixins";

export interface ErrorContext extends WithBaseContextMixin, WithErrorContextMixin, WithTypeContextMixin {}
