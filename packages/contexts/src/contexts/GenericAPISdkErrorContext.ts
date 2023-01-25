import { WithBaseContextMixin } from "./mixins";
import { WithGenericAPISdkErrorContextMixin } from "./mixins/GenericAPISdkErrorContextMixin";

export interface GenericAPISdkErrorContext extends WithBaseContextMixin, WithGenericAPISdkErrorContextMixin {}
