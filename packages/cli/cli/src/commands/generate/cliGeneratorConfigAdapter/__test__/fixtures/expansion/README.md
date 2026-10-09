# Expansion parity fixture

`sdk-gen-api-ir.json` is what sdk-gen-api's `expandSdkConfigTarget` (`src/build/fern-sdk-config-expander.ts`, postman-eng/sdk-gen-api `1f969ac0`) returns for the `cli` target of `sdk-config.yml`, with organization `acme-org` and API name `api`. It was captured on 2026-10-09 by running this script with `npx tsx` from the sdk-gen-api repository root:

```ts
import fs from 'node:fs';
import YAML from 'yaml';
import { parseSdkConfigV1, validateSdkConfigV1 } from '@postman/sdk-config';
import { expandSdkConfigTarget } from './src/build/fern-sdk-config-expander';

const [input, output] = process.argv.slice(2);
const sdkConfig = parseSdkConfigV1(validateSdkConfigV1(YAML.parse(fs.readFileSync(input, 'utf8'))));
const ir = expandSdkConfigTarget(sdkConfig, {
  organizationId: 'acme-org',
  apiName: 'api',
  // Only the fields the expander reads.
  target: {
    targetId: 'cli',
    language: 'cli',
    fernGenerator: { id: 'fernapi/fern-cli-generator' },
    sdk: { name: sdkConfig.sdkName, version: sdkConfig.sdkVersion },
    invocation: {},
    requestedOutput: { type: 'download' },
  } as never,
  sources: sdkConfig.source.specs.map(spec => ({
    specType: spec.type,
    specUrl: spec.path ?? spec.url ?? '',
    ...(spec.id !== undefined ? { id: spec.id } : {}),
    ...(spec.namespace !== undefined ? { namespace: spec.namespace } : {}),
  })) as never,
});
fs.writeFileSync(output, `${JSON.stringify(ir, null, 2)}\n`);
```

Recapture it when sdk-gen-api's expander or `@postman/sdk-config` changes.
