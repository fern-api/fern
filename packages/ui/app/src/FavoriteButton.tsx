import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import styles from "./FavoriteButton.module.scss";

export declare namespace FavoriteButton {
    export interface Props {
        isFavorited: boolean;
    }
}

export const FavoriteButton: React.FC<FavoriteButton.Props> = ({ isFavorited }) => {
    const { isHovering, onMouseLeave, onMouseEnter } = useIsHovering();

    return (
        <Icon
            className={classNames(styles.icon, {
                [styles.highlighted ?? "_"]: isFavorited || isHovering,
            })}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            icon={isFavorited ? IconNames.STAR : IconNames.STAR_EMPTY}
        />
    );
};
