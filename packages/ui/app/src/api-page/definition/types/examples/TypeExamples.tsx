import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { DefinitionItemExamples } from "../../examples/DefinitionItemExamples";
import { JsonExample } from "../../examples/JsonExample";

export declare namespace TypeExamples {
    export interface Props {
        type: FernRegistry.TypeDefinition;
    }
}

export const TypeExamples: React.FC<TypeExamples.Props> = ({ type }) => {
    const examples = useMemo(() => {
        return type.examples.map((example) => ({
            name: undefined,
            docs: undefined,
            render: () => <JsonExample json={example.json} />,
        }));
    }, [type]);

    return <DefinitionItemExamples examples={examples} />;
};
