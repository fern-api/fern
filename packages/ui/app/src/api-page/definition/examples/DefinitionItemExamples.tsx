import { NonIdealState } from "@blueprintjs/core";
import { useNumericState } from "@fern-api/react-commons";
import { Docs } from "../docs/Docs";
import { DefinitionItemExamplesLayout } from "./DefinitionItemExamplesLayout";
import { ExampleChevron } from "./ExampleChevron";
import { ExampleDot } from "./ExampleDot";

export interface Example {
    name: string | undefined;
    docs: string | undefined;
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
            topRightContent={
                examples.length > 1 ? (
                    <div className="flex items-center gap-2 ml-3">
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
            {example != null ? (
                <div className="flex flex-col p-5 overflow-y-auto">
                    <div className="text-lg font-bold">{example.name ?? "Example"}</div>
                    {example.docs != null && (
                        <div className="mt-1">
                            <Docs docs={example.docs} />
                        </div>
                    )}
                    <div className="flex flex-col mt-5">{example.render()}</div>
                </div>
            ) : (
                <NonIdealState title="No examples" />
            )}
        </DefinitionItemExamplesLayout>
    );
};
