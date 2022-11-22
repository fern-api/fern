import { TypeContext } from "../TypeContext";

export interface GeneratedEnumType {
    type: "enum";
    writeToFile: (context: TypeContext) => void;
}
