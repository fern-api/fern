import { Description } from "../types/Description";

export interface Example {
    name: string | undefined;
    htmlDescription: string | undefined;
    render: () => JSX.Element;
}

export declare namespace DefinitionItemExamples {
    export interface Props {
        examples: Example[];
    }
}

export const DefinitionItemExamples: React.FC<DefinitionItemExamples.Props> = ({ examples }) => {
    const example = examples[0];

    if (example == null) {
        return null;
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {example.name != null && <div className="mb-1 text-lg font-medium">{example.name}</div>}
            <Description htmlDescription={example.htmlDescription} />
            <div className="flex min-h-0 flex-1 flex-col">{example.render()}</div>
        </div>
    );
};
