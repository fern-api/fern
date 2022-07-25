import { Code, H1 } from "@blueprintjs/core";
import { ThemeProvider } from "@fern-ui/theme";
import { useState } from "react";
import styles from "./App.module.css";

console.log(styles);

function App() {
    const [count, setCount] = useState(0);

    return (
        <ThemeProvider defaultIsDarkTheme={false}>
            <div className={styles.app}>
                <div>
                    <a href="https://vitejs.dev" target="_blank">
                        <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
                    </a>
                </div>
                <H1>Vite + React</H1>
                <div className={styles.card}>
                    <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                    <p>
                        Edit <Code>src/App.tsx</Code> and save to test HMR
                    </p>
                </div>
                <p className={styles.readTheDocs}>Click on the Vite and React logos to learn more</p>
            </div>
        </ThemeProvider>
    );
}

export default App;
