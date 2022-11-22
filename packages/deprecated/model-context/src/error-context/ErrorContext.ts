import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { ImportStrategy } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "../base-model-context/BaseModelContext";
import { ErrorResolver } from "./ErrorResolver";

export declare namespace ErrorContext {
    namespace getReferenceToError {
        interface Args {
            errorName: DeclaredErrorName;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }

    namespace getReferenceToErrorUtils {
        interface Args {
            errorName: DeclaredErrorName;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class ErrorContext extends BaseModelContext {
    private errorResolver: ErrorResolver;

    constructor({
        modelDirectory,
        intermediateRepresentation,
    }: {
        modelDirectory: Directory;
        intermediateRepresentation: IntermediateRepresentation;
    }) {
        super({
            modelDirectory,
            intermediateDirectories: ["_errors"],
        });
        this.errorResolver = new ErrorResolver(intermediateRepresentation);
    }
    public addErrorDeclaration(errorName: DeclaredErrorName, withFile: (file: SourceFile) => void): void {
        this.addFile({
            item: {
                typeName: errorName.name,
                fernFilepath: errorName.fernFilepath,
            },
            withFile,
        });
    }

    public getReferenceToError({
        errorName,
        importStrategy,
        referencedIn,
    }: ErrorContext.getReferenceToError.Args): ts.TypeReferenceNode {
        return this.getReferenceToModelItemType({
            item: {
                typeName: errorName.name,
                fernFilepath: errorName.fernFilepath,
            },
            importStrategy,
            referencedIn,
        });
    }

    public getReferenceToErrorUtils({
        errorName,
        referencedIn,
        importStrategy,
    }: ErrorContext.getReferenceToErrorUtils.Args): ts.Expression {
        return this.getReferenceToModelItemValue({
            item: {
                typeName: errorName.name,
                fernFilepath: errorName.fernFilepath,
            },
            referencedIn,
            importStrategy,
        });
    }

    public getErrorDeclarationFromName(errorName: DeclaredErrorName): ErrorDeclaration {
        return this.errorResolver.getErrorDeclarationFromName(errorName);
    }
}
