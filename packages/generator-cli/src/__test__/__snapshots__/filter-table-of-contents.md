# Basic TypeScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Basic%2FTypeScript)
[![npm shield](https://img.shields.io/npm/v/basic)](https://www.npmjs.com/package/basic)

The Basic TypeScript library provides convenient access to the Basic APIs from TypeScript.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Installation

```sh
npm i -s basic
```

## Usage

```typescript
import { BasicClient } from "basic";

const client = new BasicClient({ apiKey: "YOUR_API_KEY" });```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!