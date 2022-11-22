import { TypeContext } from "../contexts/TypeContext";

export interface GeneratedEnumType {
    type: "enum";
    writeToFile: (context: TypeContext) => void;
}
