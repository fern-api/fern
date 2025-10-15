# JSON Diff Report
Generated: 2025-10-14T22:05:25.352Z

## Summary
- Total differences: 22
- Keys only in local: 12
- Keys only in remote: 3
- Different values: 7

## Top-Level Differences

### Top-level keys comparison:
Local keys: selfHosted, fdrApiDefinitionId, apiVersion, apiName, apiDisplayName, apiDocs, auth, headers, idempotencyHeaders, types, errors, services, constants, environments, errorDiscriminationStrategy, basePath, pathParameters, variables, serviceTypeReferenceInfo, webhookGroups, websocketChannels, readmeConfig, sourceConfig, publishConfig, dynamic, audiences, subpackages, rootPackage, sdkConfig
Remote keys: selfHosted, fdrApiDefinitionId, apiVersion, apiName, apiDisplayName, apiDocs, auth, headers, idempotencyHeaders, types, errors, services, constants, environments, errorDiscriminationStrategy, basePath, pathParameters, variables, serviceTypeReferenceInfo, webhookGroups, websocketChannels, readmeConfig, sourceConfig, publishConfig, dynamic, audiences, subpackages, rootPackage, sdkConfig

Top-level differences:
- "selfHosted" has different values
- "fdrApiDefinitionId" has different values
- "services" has different values
- "readmeConfig" has different values
- "publishConfig" has different values
- "dynamic" has different values
- "sdkConfig" has different values

## Keys Only in Local File (showing first 100)
- readmeConfig.exampleStyle: null
- publishConfig.type: "github"
- publishConfig.owner: "fern-api"
- publishConfig.repo: "lattice-sdk-javascript"
- publishConfig.uri: "fern-api/lattice-sdk-javascript"
- publishConfig.token: "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"
- publishConfig.mode: "pull-request"
- publishConfig.target.type: "npm"
- publishConfig.target.packageName: "@anduril-industries/lattice-sdk"
- publishConfig.target.version: "0.0.0"
- publishConfig.target.tokenEnvironmentVariable: "NPM_TOKEN"
- sdkConfig.platformHeaders.userAgent: null

## Keys Only in Remote File (showing first 100)
- publishConfig: null
- sdkConfig.platformHeaders.userAgent.header: "User-Agent"
- sdkConfig.platformHeaders.userAgent.value: "@anduril-industries/lattice-sdk/2.4.1"

## Different Values (showing first 100)
- selfHosted:
  Local:  true
  Remote: false

- fdrApiDefinitionId:
  Local:  null
  Remote: "bb597429-72b8-46ac-8517-22877f0c4e72"

- services.service_entities.endpoints:
  Local:  [{"id":"endpoint_entities.publishEntity","name":{"originalName":"publishEntity","camelCase":{"unsafe...
  Remote: [{"id":"endpoint_entities.publishEntity","name":{"originalName":"publishEntity","camelCase":{"unsafe...

- services.service_tasks.endpoints:
  Local:  [{"id":"endpoint_tasks.createTask","name":{"originalName":"createTask","camelCase":{"unsafeName":"cr...
  Remote: [{"id":"endpoint_tasks.createTask","name":{"originalName":"createTask","camelCase":{"unsafeName":"cr...

- services.service_objects.endpoints:
  Local:  [{"id":"endpoint_objects.listObjects","name":{"originalName":"listObjects","camelCase":{"unsafeName"...
  Remote: [{"id":"endpoint_objects.listObjects","name":{"originalName":"listObjects","camelCase":{"unsafeName"...

- dynamic.generatorConfig.outputConfig.value.version:
  Local:  "99.99.99"
  Remote: "3.8.0"

- dynamic.generatorConfig.outputConfig.value.repoUrl:
  Local:  null
  Remote: "https://github.com/fern-api/lattice-sdk-javascript"


## File Size Comparison
- Local file: 77512087 bytes
- Remote file: 9358635 bytes
- Size difference: 68153452 bytes
