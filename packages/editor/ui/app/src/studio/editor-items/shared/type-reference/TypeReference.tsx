import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Container } from "./container/Container";
import { NamedType } from "./named/NamedType";
import { Primitive } from "./primitive/Primitive";
import styles from "./TypeReference.module.scss";
import { Unknown } from "./unknown/Unknown";

export declare namespace TypeReference {
    export interface Props {
        typeReference: FernApiEditor.TypeReference;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const TypeReference: React.FC<TypeReference.Props> = ({ typeReference, onChange }) => {
    return (
        <div className={styles.container}>
            {typeReference._visit({
                container: (container) => <Container container={container} onChange={onChange} />,
                primitive: (primitive) => <Primitive primitive={primitive} onChange={onChange} />,
                named: (typeId) => <NamedType typeId={typeId} />,
                unknown: () => <Unknown />,
                _other: ({ type }) => {
                    throw new Error("Unknown TypeReference type: " + type);
                },
            })}
        </div>
    );
};
