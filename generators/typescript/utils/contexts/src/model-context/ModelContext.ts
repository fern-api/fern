import { BaseContext } from "../base-context";
import { TypeContext } from "./type";
import { TypeSchemaContext } from "./type-schema";

export interface ModelContext extends BaseContext {
    type: TypeContext;
    typeSchema: TypeSchemaContext;
}
