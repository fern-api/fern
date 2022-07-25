import { FormDialogContents } from "./FormDialogContents";

export interface SingleContextedFormDialogSetup<S> {
    initialFormState: S;
    Renderer: SingleContextedFormDialogProviderRenderer<S>;
}

export type SingleContextedFormDialogProviderRenderer<S> = (
    props: React.PropsWithChildren<{ Provider: SingleContextedFormDialogProvider<S> }>
) => JSX.Element | null;

export type SingleContextedFormDialogProvider<S> = <P, R>(
    props: React.PropsWithChildren<SingleContextedFormDialogProviderProps<S, P, R>>
) => JSX.Element;

export interface SingleContextedFormDialogProviderProps<S, P, R>
    extends Omit<FormDialogContents.Props<P, R>, "closeDialog" | "children"> {
    formState: S | undefined;
    setFormState: (formState: S | undefined) => void;
    dialogTitle: string;
    renderForm: (state: S, args: RenderFormDialogArgs) => JSX.Element;
}

export type OpenFormDialogHooks<K extends string> = {
    hooks: Record<K, () => () => void>;
} & EasyOpenFormDialogHooks<K>;

export type EasyOpenFormDialogHooks<K extends string> = {
    [k in K as `useOpen${Capitalize<k>}Form`]: () => () => void;
};

export interface RenderFormDialogArgs {
    shouldHighlightInvalidFields: boolean;
    shouldDisableFields: boolean;
    isDialogOpen: boolean;
}
