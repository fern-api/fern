import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressEndpointTypeSchemasContextMixin } from "./ExpressEndpointTypeSchemasContextMixin";

export interface ExpressEndpointTypeSchemasContext
    extends WithBaseContextMixin,
        WithExpressEndpointTypeSchemasContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin {}
