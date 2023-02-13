import { FernRegistry } from "@fern-fern/registry";
import styles from "./DiscriminatedUnionDefinition.module.scss";
import { DiscriminatedUnionMember } from "./DiscriminatedUnionMember";

export declare namespace DiscriminatedUnionDefinition {
    export interface Props {
        union: FernRegistry.DiscriminatedUnionType;
    }
}

export const DiscriminatedUnionDefinition: React.FC<DiscriminatedUnionDefinition.Props> = ({ union }) => {
    return (
        <div className={styles.container}>
            {union.members.map((member) => (
                <DiscriminatedUnionMember
                    key={member.discriminantValue}
                    discriminant={union.discriminant}
                    member={member}
                />
            ))}
        </div>
    );
};
