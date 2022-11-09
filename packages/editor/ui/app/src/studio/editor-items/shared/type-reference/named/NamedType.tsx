import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export declare namespace NamedType {
    export interface Props {
        typeId: FernApiEditor.TypeId;
    }
}

export const NamedType: React.FC<NamedType.Props> = ({ typeId }) => {
    return <div>{typeId}</div>;
};
