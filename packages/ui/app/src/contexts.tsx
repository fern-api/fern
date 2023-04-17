import { HotkeysProvider } from "@blueprintjs/core";
import { SplitViewProvider } from "@fern-api/split-view";
import { ThemeProvider } from "@fern-api/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { Auth0ProviderWithHistory } from "./auth/Auth0ProviderWithHistory";

const queryClient = new QueryClient();

// these are client-side safe
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN ?? "fern-prod.us.auth0.com";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID ?? "rTDcpFMWvsv9U36EZ81TsDPofuPCylCg";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProvider>{children}</ThemeProvider>,
    BrowserRouter,
    ({ children }: PropsWithChildren): JSX.Element => (
        <Auth0ProviderWithHistory domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID} loginPath="/" logoutPath="/">
            {children}
        </Auth0ProviderWithHistory>
    ),
    ({ children }: PropsWithChildren): JSX.Element => (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    ),
    HotkeysProvider,
    SplitViewProvider,
];
