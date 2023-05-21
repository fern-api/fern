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
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {example.name != null && <div className="text-lg font-bold mb-1">{example.name}</div>}
            {example.description != null && <Markdown>{example.description}</Markdown>}
            <div className="flex flex-1 flex-col mt-5 min-h-0">{example.render()}</div>
        </div>
    );
};
