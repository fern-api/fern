import { Button, Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import styles from "./ApiVersionSelect.module.scss";

export declare namespace ApiVersionSelectButton {
    export interface Props {
        environmentName: string | undefined;
    }
}

export const ApiVersionSelectButton: React.FC<ApiVersionSelectButton.Props> = ({ environmentName }) => {
    return (
        <Button
            className={classNames(styles.button, {
                [Classes.SKELETON]: environmentName == null,
            })}
            text={environmentName}
            rightIcon={IconNames.DOUBLE_CHEVRON_DOWN}
            fill
            outlined
        />
    );
};
