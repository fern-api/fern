import { SingleUnionType } from "./SingleUnionType";

export interface UnionTypeDefinition {
    discriminant: string;
    types: SingleUnionType[];
}
