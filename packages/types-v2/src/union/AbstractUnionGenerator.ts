import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { Reference, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractSchemaGenerator } from "../AbstractSchemaGenerator";
import { AbstractTypeSchemaGenerator } from "../AbstractTypeSchemaGenerator";
import { AbstractUnionDeclaration } from "./AbstractUnionDeclaration";
import { ParsedSingleUnionType } from "./parsed-single-union-type/ParsedSingleUnionType";
import { RawUnionType } from "./RawUnionType";
import { UnionConst } from "./UnionConst";
import { UnionModule } from "./UnionModule";
import { UnionSchema } from "./UnionSchema";
import { UnionTypeAlias } from "./UnionTypeAlias";
import { UnionVisitHelper } from "./UnionVisitHelper";
import { UnknownSingleUnionType } from "./UnknownSingleUnionType";

export declare namespace AbstractUnionGenerator {
    export interface Init {
        typeName: string;
        discriminant: WireStringWithAllCasings;
        docs: string | null | undefined;
        parsedSingleUnionTypes: ParsedSingleUnionType[];
        unknownSingleUnionType: UnknownSingleUnionType;
    }
}

export abstract class AbstractUnionGenerator extends AbstractTypeSchemaGenerator {
    private typeAlias: UnionTypeAlias;
    private module: UnionModule;
    private const_: UnionConst;
    private rawUnion: RawUnionType;
    private visitHelper: UnionVisitHelper;
    private schema: UnionSchema;

    constructor({
        typeName,
        discriminant,
        docs,
        parsedSingleUnionTypes,
        unknownSingleUnionType,
    }: AbstractUnionGenerator.Init) {
        super({ typeName });

        const unionFileDeclarationInit: AbstractUnionDeclaration.Init = {
            discriminant,
            docs,
            typeName,
            parsedSingleUnionTypes,
        };

        this.typeAlias = new UnionTypeAlias(unionFileDeclarationInit);
        this.module = new UnionModule({
            ...unionFileDeclarationInit,
            unknownSingleUnionType,
        });
        this.const_ = new UnionConst(unionFileDeclarationInit);
        this.rawUnion = new RawUnionType({ parsedSingleUnionTypes });
        this.schema = new UnionSchema({ discriminant, parsedSingleUnionTypes });
        this.visitHelper = new UnionVisitHelper({ parsedSingleUnionTypes, unknownSingleUnionType });
    }

    public generate({ typeFile, schemaFile }: { typeFile: SdkFile; schemaFile: SdkFile }): void {
        this.typeAlias.writeToFile(typeFile, this.module);
        this.module.writeToFile(typeFile, this.visitHelper);
        this.const_.writeToFile(typeFile, this.module);
        if (this.shouldWriteSchema()) {
            this.writeSchemaToFile(schemaFile);
        }
    }

    protected override generateRawTypeDeclaration(file: SdkFile, module: ModuleDeclaration): void {
        this.rawUnion.writeToModule({
            file,
            module,
            rawTypeName: AbstractSchemaGenerator.RAW_TYPE_NAME,
        });
    }

    protected override getSchema(file: SdkFile): Zurg.Schema {
        return this.schema.toSchema(file, {
            referenceToParsedShape: this.getReferenceToUnionType(file),
            shouldIncludeDefaultCaseInTransform: this.shouldIncludeDefaultCaseInSchemaTransform(),
        });
    }

    protected shouldIncludeDefaultCaseInSchemaTransform(): boolean {
        return true;
    }

    protected override getReferenceToParsedShape(file: SdkFile): ts.TypeNode {
        return this.getReferenceToUnionType(file).typeNode;
    }

    protected abstract getReferenceToUnionType(file: SdkFile): Reference;
    protected abstract shouldWriteSchema(): boolean;
}
