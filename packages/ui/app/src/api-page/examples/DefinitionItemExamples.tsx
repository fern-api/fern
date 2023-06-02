import { Markdown } from "../markdown/Markdown";

export interface Example {
    name: string | undefined;
    description: string | undefined;
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
            {example.description != null && <Markdown>{example.description}</Markdown>}
            <div className="flex min-h-0 flex-1 flex-col">{example.render()}</div>
        </div>
    );
};
