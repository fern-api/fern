import type { ObjectSchema } from "../object/types";
import { type SchemaGetter } from "./lazy";
export declare function lazyObject<Raw, Parsed>(getter: SchemaGetter<ObjectSchema<Raw, Parsed>>): ObjectSchema<Raw, Parsed>;
