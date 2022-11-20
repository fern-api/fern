import { TypeContext } from "../TypeContext";

export interface GeneratedType {
    writeToFile: (context: TypeContext) => void;
}
