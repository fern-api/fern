import { ModuleDeclarationStructure } from "ts-morph";

export interface GeneratedModule<Context> {
    generateModule(context: Context): ModuleDeclarationStructure | undefined;
}
