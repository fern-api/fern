import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { SmallMutedText } from "../SmallMutedText";
import { TypeDefinitionDetailsWithTitle } from "../TypeDefinitionDetailsWithTitle";
import styles from "./DiscriminatedUnionMember.module.scss";

export declare namespace DiscriminatedUnionMember {
    export interface Props {
        discriminant: string;
        member: FernRegistry.UnionMember;
    }
}

export const DiscriminatedUnionMember: React.FC<DiscriminatedUnionMember.Props> = ({ discriminant, member }) => {
    const additionalPropertiesTypeDefinition = useMemo(
        () =>
            member.additionalProperties.extends.length > 0 || member.additionalProperties.properties.length > 0
                ? FernRegistry.Type.object(member.additionalProperties)
                : undefined,
        [member.additionalProperties]
    );

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <div className={styles.dash} />
                <div className={styles.key}>
                    <MonospaceText>{discriminant}</MonospaceText>
                </div>
                <SmallMutedText>{`"${member.discriminantValue}"`}</SmallMutedText>
            </div>
            <div className={styles.docs}>
                An arbitrary string attached to the object. Often useful for displaying to users.
            </div>
            {additionalPropertiesTypeDefinition != null && (
                <div className={styles.children}>
                    <TypeDefinitionDetailsWithTitle
                        title="additional properties"
                        typeDefinition={additionalPropertiesTypeDefinition}
                        defaultIsCollapsed={true}
                    />
                </div>
            )}
        </div>
    );
};
