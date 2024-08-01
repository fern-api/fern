cd ..
mkdir browser-test
cd browser-test
cp -r ../fern/seed/ts-sdk/imdb/no-custom-config ./imdb
cd imdb
npm install
npm run build
npx create-react-app my-ts-app --template typescript
cp -r dist my-ts-app/src/dist
cd my-ts-app
cat << 'EOF' > src/App.tsx
import React from 'react';
import logo from './logo.svg';
import './App.css';
import { SeedApiClient } from './dist';

new SeedApiClient({ environment: "production" });
console.log("SeedApiClient import was successful");

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
EOF

echo "BROWSER=none" > .env
echo "DISABLE_ESLINT_PLUGIN=true" >> .env

npm install
output=$(timeout 25s npm run start &)
echo "$output"
if echo "$output" | grep -q "Compiled successfully!"; then
    echo "Compiled successfully"
else
    echo "Failed to compile"
    exit 1
fi
cd ../../..
rm -rf browser-test
