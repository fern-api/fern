import classNames from "classnames";
import { Link, LinkProps } from "react-router-dom";
import styles from "./UnstyledLink.module.scss";

export declare namespace UnstyledLink {
    export interface Props extends LinkProps {
        showUnderline?: boolean;
        muted?: boolean;
        noHoverState?: boolean;
    }
}

export const UnstyledLink: React.FC<UnstyledLink.Props> = ({
    className,
    showUnderline = false,
    muted = false,
    noHoverState = false,
    ...linkProps
}) => {
    return (
        <Link
            className={classNames(styles.link, className, {
                [styles.showUnderline]: showUnderline,
                [styles.muted]: muted,
                [styles.hoverState]: !noHoverState,
            })}
            {...linkProps}
        />
    );
};
