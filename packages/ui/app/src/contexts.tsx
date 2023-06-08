import { ThemeProvider } from "@fern-api/theme";
import { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProvider theme="dark">{children}</ThemeProvider>,
    BrowserRouter,
];
