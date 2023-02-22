import { useNumericState } from "@fern-api/react-commons";
import { ExampleDot } from "./ExampleDot";

export declare namespace Examples {
    export interface Props<T> {
        examples: readonly T[];
        renderExample: (example: T) => JSX.Element;
    }
}

export function Examples<T>({ examples, renderExample }: Examples.Props<T>): JSX.Element | null {
    const { value: selectedIndex, setValue: setSelectedIndex } = useNumericState(0);
    const example = examples[selectedIndex];

    if (example == null) {
        return null;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden p-3">
            {examples.length > 0 && (
                <div className="flex justify-center gap-2 mb-3">
                    {examples.map((_example, index) => (
                        <ExampleDot
                            key={index}
                            index={index}
                            isSelected={index === selectedIndex}
                            setSelectedIndex={setSelectedIndex}
                        />
                    ))}
                </div>
            )}
            {renderExample(example)}
        </div>
    );
}
