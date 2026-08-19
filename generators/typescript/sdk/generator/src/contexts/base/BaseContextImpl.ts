import { CaseConverter } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    CoreUtilities,
    CoreUtilitiesManager,
    createExternalDependencies,
    DependencyManager,
    ExportsManager,
    ExternalDependencies,
    ImportsManager
} from "@fern-typescript/commons";
import { BaseContext, JsonContext, TypeContext, TypeSchemaContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

export declare namespace BaseContextImpl {
    export interface Init {
        logger: Logger;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: FernIr.Constants;
        type: TypeContext;
        typeSchema: TypeSchemaContext;
        jsonContext: JsonContext;
        includeSerdeLayer: boolean;
        relativePackagePath: string;
        relativeTestPath: string;
        case: CaseConverter;
    }
}

export class BaseContextImpl implements BaseContext {
    public readonly case: CaseConverter;
    public readonly logger: Logger;
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernIr.Constants;
    public readonly type: TypeContext;
    public readonly typeSchema: TypeSchemaContext;
    public readonly includeSerdeLayer: boolean;
    public readonly jsonContext: JsonContext;

    constructor({
        logger,
        sourceFile,
        importsManager,
        exportsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
        type,
        typeSchema,
        includeSerdeLayer,
        jsonContext,
        relativePackagePath,
        relativeTestPath,
        case: caseConverter
    }: BaseContextImpl.Init) {
        this.case = caseConverter;
        this.logger = logger;
        this.sourceFile = sourceFile;
        this.fernConstants = fernConstants;
        this.type = type;
        this.typeSchema = typeSchema;
        this.jsonContext = jsonContext;
        this.includeSerdeLayer = includeSerdeLayer;
        this.externalDependencies = createExternalDependencies({
            dependencyManager,
            importsManager
        });
        this.coreUtilities = coreUtilitiesManager.getCoreUtilities({
            sourceFile,
            importsManager,
            exportsManager,
            relativePackagePath,
            relativeTestPath
        });
    }
}
