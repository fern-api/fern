import { HotkeysProvider } from "@blueprintjs/core";
import { createContextedFormDialogsProvider } from "@fern-api/contexted-dialog";
import { SplitViewProvider } from "@fern-api/split-view";
import { ThemeProvider } from "@fern-api/theme";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import {
    CreateEnvironmentFormDialogProviderRenderer,
    INITIAL_ENVIRONMENT_FORM_STATE,
} from "./apis-page/tabs/environments/create-environments-form/CreateEnvironmentFormProviderRenderer";
import { Auth0ProviderWithHistory } from "./auth/Auth0ProviderWithHistory";

const { ContextedFormDialogsProvider, useOpenCreateEnvironmentForm } = createContextedFormDialogsProvider({
    createEnvironment: {
        initialFormState: INITIAL_ENVIRONMENT_FORM_STATE,
        Renderer: CreateEnvironmentFormDialogProviderRenderer,
    },
});
export { useOpenCreateEnvironmentForm };

const queryClient = new QueryClient();

// these are client-side safe
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN ?? "fern-prod.us.auth0.com";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID ?? "rTDcpFMWvsv9U36EZ81TsDPofuPCylCg";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProvider theme="light">{children}</ThemeProvider>,
    BrowserRouter,
    ({ children }: PropsWithChildren): JSX.Element => (
        <Auth0ProviderWithHistory domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID} loginPath="/" logoutPath="/">
            {children}
        </Auth0ProviderWithHistory>
    ),
    ({ children }: PropsWithChildren): JSX.Element => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    HotkeysProvider,
    SplitViewProvider,
    ContextedFormDialogsProvider,
];
