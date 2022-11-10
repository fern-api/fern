import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export declare namespace Literal {
    export interface Props {
        literal: FernApiEditor.Literal;
    }
}

export const Literal: React.FC<Literal.Props> = ({ literal }) => {
    return literal._visit({
        string: (value) => <div>{`"${value}"`}</div>,
        _other: ({ type }) => {
            throw new Error("Unknown Literal type: " + type);
        },
    });
};
