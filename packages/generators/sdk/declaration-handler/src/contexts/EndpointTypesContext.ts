import { Reference } from "../Reference";
import { BaseContext } from "./BaseContext";
import { ErrorReferencingContextMixin, TypeReferencingContextMixin } from "./mixins";

export interface EndpointTypesContext extends BaseContext, TypeReferencingContextMixin, ErrorReferencingContextMixin {
    getReferenceToExportFromThisFile: (export_: string | string[]) => Reference;
}
