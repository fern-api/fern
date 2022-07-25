import { keys } from "@fern-api/core-utils";
import { createContextedDialog } from "./createContextedDialog";
import { EasyOpenDialogHooks, OpenDialogHooks, SingleContextedDialogProviderRenderer } from "./types";
import { typedCapitalize } from "./utils";

export function createContextedDialogsProvider<K extends string>(dialogs: {
    [k in K]: SingleContextedDialogProviderRenderer;
}): {
    ContextedDialogsProvider: React.ComponentType;
} & OpenDialogHooks<K> {
    const providers: React.ComponentType<React.PropsWithChildren>[] = [];

    const hooks = {} as Record<K, () => () => void>;
    const easyHooks = {} as EasyOpenDialogHooks<K>;

    for (const key of keys(dialogs)) {
        const { useOpenDialog, Provider } = createContextedDialog(key);
        const Renderer: SingleContextedDialogProviderRenderer = dialogs[key];
        providers.push(({ children }) => <Renderer Provider={Provider}>{children}</Renderer>);
        hooks[key] = useOpenDialog;
        easyHooks[`useOpen${typedCapitalize(key)}Dialog`] = useOpenDialog;
    }

    const ContextedDialogsProvider: React.ComponentType<React.PropsWithChildren> = ({ children }) =>
        providers.reduce((element, Provider) => <Provider>{element}</Provider>, <>{children}</>);

    return {
        hooks,
        ...easyHooks,
        ContextedDialogsProvider,
    };
}
