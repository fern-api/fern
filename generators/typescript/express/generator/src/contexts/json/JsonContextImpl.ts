import { ImportsManager, Reference } from "@fern-typescript/commons";
import { JsonContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

import { JsonDeclarationReferencer } from "../../declaration-referencers/JsonDeclarationReferencer";

export declare namespace JsonContextImpl {
    export interface Init {
        jsonDeclarationReferencer: JsonDeclarationReferencer;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class JsonContextImpl implements JsonContext {
    private jsonDeclarationReferencer: JsonDeclarationReferencer;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({ jsonDeclarationReferencer, importsManager, sourceFile }: JsonContextImpl.Init) {
        this.jsonDeclarationReferencer = jsonDeclarationReferencer;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getReferenceToFromJson(): Reference {
        return this.jsonDeclarationReferencer.getReferenceToFromJson({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile
        });
    }

    public getReferenceToToJson(): Reference {
        return this.jsonDeclarationReferencer.getReferenceToToJson({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile
        });
    }
}
