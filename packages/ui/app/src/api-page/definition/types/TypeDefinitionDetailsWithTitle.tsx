import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useApiContext } from "../../context/useApiContext";
import { DiscriminatedUnionDefinition } from "./discriminated-union/DiscriminatedUnionDefinition";
import { ObjectDefinition } from "./object/ObjectDefinition";
import { SmallMutedText } from "./SmallMutedText";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";
import styles from "./TypeDefinitionDetailsWithTitle.module.scss";

export declare namespace TypeDefinitionDetailsWithTitle {
    export interface Props {
        title: JSX.Element | string;
        typeDefinition: FernRegistry.Type;
        defaultIsCollapsed: boolean;
    }
}

export const TypeDefinitionDetailsWithTitle: React.FC<TypeDefinitionDetailsWithTitle.Props> = ({
    title,
    typeDefinition,
    defaultIsCollapsed,
}) => {
    const { resolveType } = useApiContext();

    const details = typeDefinition._visit<JSX.Element | null>({
        reference: (typeId) => <TypeDefinitionDetails typeDefinition={resolveType(typeId)} />,
        object: (object) => <ObjectDefinition object={object} />,
        enum: () => <span>enum</span>,
        primitive: () => null,
        list: () => <span>list</span>,
        set: () => <span>set</span>,
        map: () => <span>map</span>,
        optional: () => <span>optional</span>,
        unknown: () => null,
        discriminatedUnion: (union) => <DiscriminatedUnionDefinition union={union} />,
        _other: () => null,
    });

    const isCollapsible = details != null;
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(isCollapsible && defaultIsCollapsed);
    const onClickTitle = isCollapsible ? toggleIsCollapsed : undefined;

    return (
        <div className={styles.container}>
            {isCollapsible && (
                <div
                    className={classNames(styles.caret, {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.clickable!]: onClickTitle != null,
                    })}
                    onClick={onClickTitle}
                >
                    <SmallMutedText>
                        <Icon
                            className={styles.collapseIcon}
                            icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                            size={12}
                        />
                    </SmallMutedText>
                </div>
            )}
            <div
                className={classNames(styles.title, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.clickable!]: onClickTitle != null,
                })}
                onClick={onClickTitle}
            >
                <SmallMutedText>{title}</SmallMutedText>
            </div>

            {details != null && !isCollapsed && (
                <>
                    <div className={styles.leftLine}>
                        <div className={styles.leftLineInner}></div>
                    </div>
                    <div className={styles.details}>{details}</div>
                </>
            )}
        </div>
    );
};
