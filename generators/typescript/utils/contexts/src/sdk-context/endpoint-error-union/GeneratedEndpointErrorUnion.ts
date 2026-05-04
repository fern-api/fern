import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { GeneratedUnion } from "../../commons/GeneratedUnion.js";
import { FileContext } from "../index.js";

export interface GeneratedEndpointErrorUnion extends GeneratedFile<FileContext> {
    getErrorUnion: () => GeneratedUnion<FileContext>;
}
