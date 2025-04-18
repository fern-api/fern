import {
    CoreUtilitiesManager,
    DependencyManager,
    ExternalDependencies,
    ImportsManager,
    createExternalDependencies
} from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import { BaseContext, JsonContext, TypeContext, TypeSchemaContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

import { Logger } from "@fern-api/logger";

import { Constants } from "@fern-fern/ir-sdk/api";

export declare namespace BaseContextImpl {
    export interface Init {
        logger: Logger;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: Constants;
        type: TypeContext;
        typeSchema: TypeSchemaContext;
        jsonContext: JsonContext;
        includeSerdeLayer: boolean;
    }
}

export class BaseContextImpl implements BaseContext {
    public readonly logger: Logger;
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: Constants;
    public readonly type: TypeContext;
    public readonly typeSchema: TypeSchemaContext;
    public readonly includeSerdeLayer: boolean;
    public readonly jsonContext: JsonContext;

    constructor({
        logger,
        sourceFile,
        importsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
        type,
        typeSchema,
        includeSerdeLayer,
        jsonContext
    }: BaseContextImpl.Init) {
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
            importsManager
        });
    }
}
