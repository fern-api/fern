import { Classes, Dialog, DialogProps } from "@blueprintjs/core";
import classNames from "classnames";
import { useIsDarkTheme } from "./ThemeProvider";

export const ThemedDialog: React.FC<DialogProps> = ({ className, ...props }) => {
    const isDarkTheme = useIsDarkTheme();
    return (
        <Dialog
            className={classNames(className, {
                [Classes.DARK]: isDarkTheme,
            })}
            {...props}
        />
    );
};
