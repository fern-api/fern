import { ThemedDialog } from "@fern-api/theme";
import classNames from "classnames";
import { createContext, useCallback, useContext } from "react";
import styles from "./createContextedDialog.module.scss";
import { SingleContextedDialog, SingleContextedDialogContextValue, SingleContextedDialogProviderProps } from "./types";

export function createContextedDialog<K extends string>(key: K): SingleContextedDialog {
    const ContextedDialogContext = createContext<() => SingleContextedDialogContextValue<K>>(() => {
        throw new Error("ContextedDialogContext was not provided for key: " + key);
    });

    function Provider({
        isOpen,
        setIsOpen,
        dialogContent,
        dialogProps,
        children,
    }: React.PropsWithChildren<SingleContextedDialogProviderProps>) {
        const contextValue = useCallback(
            (): SingleContextedDialogContextValue<K> => ({
                isOpen,
                setIsOpen,
                key,
            }),
            [isOpen, setIsOpen]
        );

        const onClose = useCallback(() => {
            setIsOpen(false);
        }, [setIsOpen]);

        return (
            <ContextedDialogContext.Provider value={contextValue}>
                <ThemedDialog
                    {...dialogProps}
                    className={classNames(dialogProps?.className, styles.dialog)}
                    isOpen={isOpen}
                    onClose={onClose}
                >
                    {dialogContent}
                </ThemedDialog>
                {children}
            </ContextedDialogContext.Provider>
        );
    }

    function useOpenDialog() {
        const context = useContext(ContextedDialogContext)();
        return useCallback(() => {
            if (!context.isOpen) {
                context.setIsOpen(true);
            }
        }, [context]);
    }

    return {
        Provider,
        useOpenDialog,
    };
}
