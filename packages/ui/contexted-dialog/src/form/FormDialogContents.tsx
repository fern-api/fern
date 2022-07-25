import { Button, Classes, Intent } from "@blueprintjs/core";
import { assertNever, withMinimumTime } from "@fern-api/commons";
import { errorToast, Toast } from "@fern-ui/toaster";
import { useCallback, useMemo, useReducer, useRef } from "react";
import { RenderFormDialogArgs } from "./types";

export declare namespace FormDialogContents {
    export interface Props<P, R> {
        createPayload: P | undefined;
        onClickCreate: (payload: P) => Promise<R>;
        errorToastText: string;
        children: (
            args: Pick<RenderFormDialogArgs, "shouldDisableFields" | "shouldHighlightInvalidFields">
        ) => JSX.Element;
        onSuccessfulCreate?: (result: R) => void;
        closeDialog: () => void;
    }
}

export function FormDialogContents<P, R>({
    createPayload,
    onClickCreate,
    errorToastText,
    children,
    onSuccessfulCreate,
    closeDialog,
}: FormDialogContents.Props<P, R>): JSX.Element {
    const [createState, updateCreateState] = useReducer(
        (_oldState: unknown, action: "invalid_fields" | "creating" | "failed_to_create") => {
            switch (action) {
                case "invalid_fields":
                    return {
                        isCreating: false,
                        shouldHighlightInvalidFields: true,
                    };
                case "creating":
                    return {
                        isCreating: true,
                        shouldHighlightInvalidFields: false,
                    };
                case "failed_to_create":
                    return {
                        isCreating: false,
                        shouldHighlightInvalidFields: false,
                    };
                default:
                    assertNever(action);
            }
        },
        {
            isCreating: false,
            shouldHighlightInvalidFields: false,
        }
    );

    const failedToast = useRef<Toast>();

    const handleClickCreate = useMemo(() => {
        return async () => {
            failedToast.current?.dismiss();

            if (createPayload == null) {
                updateCreateState("invalid_fields");
                return;
            }
            updateCreateState("creating");

            try {
                const result = await withMinimumTime(onClickCreate(createPayload), 1_000);
                onSuccessfulCreate?.(result);
                closeDialog();
            } catch (e) {
                console.error("Failed to create", e);
                failedToast.current = errorToast(errorToastText, {
                    toastKey: failedToast.current?.toastKey,
                });
                updateCreateState("failed_to_create");
            }
        };
    }, [onClickCreate, createPayload, onSuccessfulCreate, closeDialog, errorToastText]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter") {
                handleClickCreate();
            }
        },
        [handleClickCreate]
    );

    const form = children({
        shouldHighlightInvalidFields: createState.shouldHighlightInvalidFields,
        shouldDisableFields: createState.isCreating,
    });

    return (
        <div onKeyPress={onKeyDown}>
            <div className={Classes.DIALOG_BODY}>{form}</div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button
                        intent={Intent.SUCCESS}
                        disabled={handleClickCreate == null}
                        onClick={handleClickCreate}
                        loading={createState.isCreating}
                    >
                        Create
                    </Button>
                </div>
            </div>
        </div>
    );
}
