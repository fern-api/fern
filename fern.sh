#!/usr/bin/env sh

set -e

npx --yes fern-api@0.0.15 generate packages/api/src packages/api/generated/ir.json
npx --yes fern-typescript@0.0.9 model packages/api/generated/ir.json packages/api/generated/ir

cat > packages/api/generated/ir/package.json <<EOL
{
  "name": "@fern-api/api",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": [
    "lib"
  ],
  "scripts": {
    "compile": "tsc --build",
    "prepublish": "run compile"
  },
  "devDependencies": {
    "typescript": "^4.6.3"
  }
}
EOL

cat > packages/api/generated/ir/tsconfig.json <<EOL
{
	"extends": "../../../../shared/tsconfig.shared.json",
	"compilerOptions": {
		"composite": true,
		"outDir": "./lib",
		"rootDir": "src",
		"module": "CommonJS"
	},
	"include": ["./src"],
	"references": []
}
EOL

cat > packages/api/generated/ir/src/index.ts <<EOL
export * from "./model";
EOL