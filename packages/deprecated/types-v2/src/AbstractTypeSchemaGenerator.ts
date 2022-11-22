import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractSchemaGenerator } from "./AbstractSchemaGenerator";

export abstract class AbstractTypeSchemaGenerator extends AbstractSchemaGenerator {
    protected override generateModule(file: SdkFile): void {
        const module = file.sourceFile.addModule({
            name: this.getModuleName(),
            isExported: true,
            hasDeclareKeyword: true,
        });
        this.generateRawTypeDeclaration(file, module);
    }

    private getModuleName() {
        return this.typeName;
    }

    protected getReferenceToRawShape(): ts.TypeNode {
        return AbstractSchemaGenerator.getReferenceToRawSchema({
            referenceToSchemaModule: ts.factory.createIdentifier(this.getModuleName()),
        });
    }

    protected abstract generateRawTypeDeclaration(file: SdkFile, module: ModuleDeclaration): void;
}
