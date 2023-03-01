import classNames from "classnames";
import { Link, LinkProps } from "react-router-dom";
import styles from "./UnstyledLink.module.scss";

export declare namespace UnstyledLink {
    export interface Props extends LinkProps {
        showUnderline?: boolean;
        muted?: boolean;
        hoverState?: boolean;
    }
}

export const UnstyledLink: React.FC<UnstyledLink.Props> = ({
    className,
    showUnderline = false,
    muted = false,
    hoverState = false,
    ...linkProps
}) => {
    return (
        <Link
            className={classNames(styles.link, className, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.showUnderline!]: showUnderline,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.muted!]: muted,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.hoverState!]: hoverState,
            })}
            {...linkProps}
        />
    );
};
