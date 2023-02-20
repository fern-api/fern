import { useNumericState } from "@fern-api/react-commons";

export declare namespace Examples {
    export interface Props<T> {
        examples: readonly T[];
        renderExample: (example: T) => JSX.Element;
    }
}

export function Examples<T>({ examples, renderExample }: Examples.Props<T>): JSX.Element | null {
    const { value: index } = useNumericState(0);
    const example = examples[index];

    if (example == null) {
        return null;
    }

    return (
        <div className="border border-sky-500 p-3 rounded">
            <div>{`Example ${index}`}</div>
            {renderExample(example)}
        </div>
    );
}
