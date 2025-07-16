import { GeneratedEnvironments } from '@fern-typescript/contexts'
import { ts } from 'ts-morph'

export class EmptyGeneratedEnvironmentsImpl implements GeneratedEnvironments {
    public writeToFile(): void {
        // no-op
    }

    public hasDefaultEnvironment(): boolean {
        return false
    }

    public getReferenceToDefaultEnvironment(): ts.Expression | undefined {
        return undefined
    }

    public getTypeForUserSuppliedEnvironment(): ts.TypeNode {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
    }

    public getReferenceToEnvironmentUrl({
        referenceToEnvironmentValue
    }: {
        referenceToEnvironmentValue: ts.Expression
    }): ts.Expression {
        return referenceToEnvironmentValue
    }
}
