import { Intent, IToaster, IToastProps, Position, Toaster, ToasterPosition } from "@blueprintjs/core";
import classNames from "classnames";
import styles from "./toaster.module.scss";

const DEFAULT_POSITION = Position.TOP;

const TOASTERS: Partial<Record<ToasterPosition, IToaster>> = {};
function getToaster(position: ToasterPosition): IToaster {
    return (TOASTERS[position] ??= Toaster.create({ position }));
}

export interface ToastParams extends Pick<IToastProps, "className" | "intent" | "icon" | "action"> {
    toastKey?: string;
    preventDismiss?: boolean;
    position?: ToasterPosition;
}

export interface Toast {
    toastKey: string;
    dismiss: () => void;
}

export function successToast(message: string, params?: Exclude<ToastParams, "intent">): Toast {
    return showToast(message, {
        ...params,
        intent: Intent.SUCCESS,
    });
}

export function errorToast(message: string, params?: Exclude<ToastParams, "intent">): Toast {
    return showToast(message, {
        ...params,
        intent: Intent.DANGER,
    });
}

export function showToast(
    message: string,
    { preventDismiss = false, position = DEFAULT_POSITION, toastKey: existingToastKey, ...toastProps }: ToastParams = {}
): Toast {
    const toaster = getToaster(position);
    const toastKey = toaster.show(
        {
            ...toastProps,
            className: classNames(toastProps.className, styles.toast, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.hideCloseButton!]: preventDismiss,
            }),
            message,
        },
        existingToastKey
    );
    return {
        toastKey,
        dismiss: () => {
            toaster.dismiss(toastKey);
        },
    };
}
