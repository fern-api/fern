import { ThemeProvider } from "@fern-api/theme";
import { PropsWithChildren } from "react";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProvider theme="dark">{children}</ThemeProvider>,
];
