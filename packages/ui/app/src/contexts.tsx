import { HotkeysProvider } from "@blueprintjs/core";
import { SplitViewProvider } from "@fern-api/split-view";
import { ThemeProvider } from "@fern-api/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProvider theme="dark">{children}</ThemeProvider>,
    BrowserRouter,
    ({ children }: PropsWithChildren): JSX.Element => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    HotkeysProvider,
    SplitViewProvider,
];
