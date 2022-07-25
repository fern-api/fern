import { DialogProps } from "@blueprintjs/core";

export type SingleContextedDialogProviderRenderer = React.ComponentType<SingleContextedDialogProviderRendererProps>;

export type SingleContextedDialogProviderRendererProps = React.PropsWithChildren<{
    Provider: SingleContextedDialogProvider;
}>;

export type OpenDialogHooks<K extends string> = {
    hooks: Record<K, () => () => void>;
} & EasyOpenDialogHooks<K>;

export type EasyOpenDialogHooks<K extends string> = {
    [k in K as `useOpen${Capitalize<k>}Dialog`]: () => () => void;
};

export interface SingleContextedDialogContextValue<K extends string> {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    key: K;
}

export interface SingleContextedDialog {
    Provider: SingleContextedDialogProvider;
    useOpenDialog: () => () => void;
}

export type SingleContextedDialogProvider = React.ComponentType<SingleContextedDialogProviderProps>;

export interface SingleContextedDialogProviderProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    dialogProps?: Omit<DialogProps, "isOpen" | "onClose">;
    dialogContent: JSX.Element | undefined;
    children: React.ReactNode;
}
