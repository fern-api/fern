import { useNumericState } from "@fern-api/react-commons";
import { Markdown } from "../markdown/Markdown";
import { DefinitionItemExamplesLayout } from "./DefinitionItemExamplesLayout";
import { ExampleChevron } from "./ExampleChevron";
import { ExampleDot } from "./ExampleDot";

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
    const {
        value: selectedIndex,
        setValue: setSelectedIndex,
        increment: incrementIndex,
        decrement: decrementIndex,
    } = useNumericState(0);

    const onClickLeft = selectedIndex > 0 ? decrementIndex : undefined;
    const onClickRight = selectedIndex < examples.length - 1 ? incrementIndex : undefined;

    const example = examples[selectedIndex];

    return (
        <DefinitionItemExamplesLayout
            topLeftContent={
                examples.length > 1 ? <div className="text-gray-500">{examples.length} examples</div> : undefined
            }
            topRightContent={
                examples.length > 1 ? (
                    <div className="flex items-center gap-2">
                        <ExampleChevron direction="left" onClick={onClickLeft} />
                        <div className="flex items-center gap-1">
                            {examples.map((_example, index) => (
                                <ExampleDot
                                    key={index}
                                    index={index}
                                    isSelected={index === selectedIndex}
                                    setSelectedIndex={setSelectedIndex}
                                />
                            ))}
                        </div>
                        <ExampleChevron direction="right" onClick={onClickRight} />
                    </div>
                ) : undefined
            }
        >
            {example != null && (
                <div className="flex flex-col pt-5 pr-5 overflow-y-auto">
                    {example.name != null && <div className="text-lg font-bold mb-1">{example.name}</div>}
                    {example.description != null && <Markdown>{example.description}</Markdown>}
                    <div className="flex flex-col mt-5">{example.render()}</div>
                </div>
            )}
        </DefinitionItemExamplesLayout>
    );
};
