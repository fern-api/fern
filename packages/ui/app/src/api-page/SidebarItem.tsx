import classNames from "classnames";
import { useApiContext } from "./context/useApiContext";
import styles from "./EndpointSidebarItem.module.scss";

export declare namespace SidebarItem {
    export interface Props {
        label: string;
        serviceIndex: number;
        endpointIndex: number | undefined;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({ label, serviceIndex, endpointIndex }) => {
    const { focusedSidebarItem } = useApiContext();
    const isFocused =
        focusedSidebarItem != null &&
        serviceIndex === focusedSidebarItem.serviceIndex &&
        endpointIndex === focusedSidebarItem.endpointIndex;

    return (
        <div
            className={classNames(styles.container, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.isFocused!]: isFocused,
            })}
        >
            {label}
        </div>
    );
};
