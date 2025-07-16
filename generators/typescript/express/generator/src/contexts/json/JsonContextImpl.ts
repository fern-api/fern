import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { JsonContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

import { JsonDeclarationReferencer } from "../../declaration-referencers/JsonDeclarationReferencer";

export declare namespace JsonContextImpl {
    export interface Init {
        jsonDeclarationReferencer: JsonDeclarationReferencer;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }
}

export class JsonContextImpl implements JsonContext {
    private jsonDeclarationReferencer: JsonDeclarationReferencer;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sourceFile: SourceFile;

    constructor({ jsonDeclarationReferencer, importsManager, exportsManager, sourceFile }: JsonContextImpl.Init) {
        this.jsonDeclarationReferencer = jsonDeclarationReferencer;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
        this.exportsManager = exportsManager;
    }

    public getReferenceToFromJson(): Reference {
        return this.jsonDeclarationReferencer.getReferenceToFromJson({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
            exportsManager: this.exportsManager
        });
    }

    public getReferenceToToJson(): Reference {
        return this.jsonDeclarationReferencer.getReferenceToToJson({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
            exportsManager: this.exportsManager
        });
    }
}
