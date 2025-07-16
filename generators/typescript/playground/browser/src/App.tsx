import { useEffect } from "react";

import "./App.css";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function App() {
    useEffect(() => {
        // void client.doSomething();
    }, []);

    return (
        <div>
            <h1>Hello Vite + React!</h1>
        </div>
    );
}

export default App;
