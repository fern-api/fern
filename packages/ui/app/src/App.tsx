import { ThemeProvider } from "@fern-ui/theme";

export const App: React.FC = () => {
    return (
        <ThemeProvider defaultIsDarkTheme>
            <div>I am a frontend!</div>
        </ThemeProvider>
    );
};
