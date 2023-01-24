import { WithBaseContextMixin } from "./mixins";
import { WithGenericAPIErrorContextMixin } from "./mixins/GenericAPIErrorContextMixin";

export interface GenericAPIErrorContext extends WithBaseContextMixin, WithGenericAPIErrorContextMixin {}
