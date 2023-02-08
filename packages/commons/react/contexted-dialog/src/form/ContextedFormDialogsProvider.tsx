import { keys } from "@fern-api/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { useCallback, useMemo } from "react";
import { createContextedDialogsProvider } from "../createContextedDialogsProvider";
import { SingleContextedDialogProviderProps, SingleContextedDialogProviderRenderer } from "../types";
import { typedCapitalize } from "../utils";
import { FormDialogContents } from "./FormDialogContents";
import {
    EasyOpenFormDialogHooks,
    OpenFormDialogHooks,
    SingleContextedFormDialogProvider,
    SingleContextedFormDialogSetup,
} from "./types";

export function createContextedFormDialogsProvider<T>(formDialogs: {
    [K in keyof T]: SingleContextedFormDialogSetup<T[K]>;
}): {
    ContextedFormDialogsProvider: React.ComponentType;
} & OpenFormDialogHooks<keyof T & string> {
    const dialogs = {} as { [k in keyof T]: SingleContextedDialogProviderRenderer };

    for (const key of keys(formDialogs)) {
        const dialog = formDialogs[key];
        const { Renderer, initialFormState } = dialog;

        dialogs[key] = ({ Provider, children }) => {
            const FormDialogProvider: SingleContextedFormDialogProvider<T[typeof key]> = ({
                formState,
                setFormState,
                dialogTitle,
                children,
                renderForm,
                ...passThroughProps
            }) => {
                const {
                    value: isDialogFullyOpen,
                    setTrue: setIsDialogFullyOpen,
                    setFalse: setIsDialogClosing,
                } = useBooleanState(false);

                const setIsOpen = useCallback(
                    (newIsOpen: boolean) => {
                        if (newIsOpen) {
                            setFormState(initialFormState);
                        } else {
                            setFormState(undefined);
                        }
                    },
                    [setFormState]
                );

                const onClose = useCallback(() => {
                    setIsOpen(false);
                }, [setIsOpen]);

                const dialogProps: SingleContextedDialogProviderProps["dialogProps"] = useMemo(
                    () => ({
                        title: dialogTitle,
                        onOpened: setIsDialogFullyOpen,
                        onClosing: setIsDialogClosing,
                    }),
                    [dialogTitle, setIsDialogClosing, setIsDialogFullyOpen]
                );

                return (
                    <Provider
                        isOpen={formState != null}
                        setIsOpen={setIsOpen}
                        dialogContent={
                            formState != null ? (
                                <FormDialogContents {...passThroughProps} closeDialog={onClose}>
                                    {(args) => renderForm(formState, { ...args, isDialogOpen: isDialogFullyOpen })}
                                </FormDialogContents>
                            ) : undefined
                        }
                        dialogProps={dialogProps}
                    >
                        {children}
                    </Provider>
                );
            };

            return <Renderer Provider={FormDialogProvider}>{children}</Renderer>;
        };
    }

    const { ContextedDialogsProvider, hooks } = createContextedDialogsProvider<keyof T & string>(dialogs);

    const easyHooks = {} as EasyOpenFormDialogHooks<keyof T & string>;
    for (const key of keys(hooks)) {
        easyHooks[`useOpen${typedCapitalize(key)}Form`] = hooks[key];
    }

    return {
        hooks,
        ...easyHooks,
        ContextedFormDialogsProvider: ContextedDialogsProvider,
    };
}
