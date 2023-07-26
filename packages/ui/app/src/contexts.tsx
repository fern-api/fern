import { ThemeProvider } from "@fern-api/theme";
import { PropsWithChildren } from "react";
import { SearchContextProvider } from "./search-context/SearchContextProvider";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProvider theme="dark">{children}</ThemeProvider>,
    ({ children }: PropsWithChildren): JSX.Element => <SearchContextProvider>{children}</SearchContextProvider>,
];
