# Fern

> **Fern is a framework for building APIs.** You can think of it as an alternative to OpenAPI (f.k.a Swagger).

## How does it work?

![Overview diagram](assets/diagrams/overview-diagram.png)

Fern reads in your [Fern API Definition](definition.md), invokes remote [generators](#generators), creates clients, server stubs, and documentation for your API.

## Generators

|  **Name**  |                                       **Description**                                        |   **CLI Command**   |                                      **Library**                                       |
| :--------: | :------------------------------------------------------------------------------------------: | :-----------------: | :------------------------------------------------------------------------------------: |
|            |                                                                                              |
| TypeScript |               converts a Fern API Definition to a TypeScript client and server               | fern add typescript | [fern-typescript](https://github.com/fern-api/fern/tree/main/packages/fern-typescript) |
|            |                                                                                              |
|    Java    |                  converts a Fern API Definition to a Java client and server                  |    fern add java    |                   [fern-java](https://github.com/fern-api/fern-java)                   |
|            |                                                                                              |
|   Python   |                 converts a Fern API Definition to a Python client and server                 |   fern add python   |                 [fern-python](https://github.com/fern-api/fern-python)                 |
|            |                                                                                              |
|  Postman   | converts a Fern API Definition to a [Postman Collection](https://www.postman.com/collection) |  fern add postman   |                [fern-postman](https://github.com/fern-api/fern-postman)                |
|            |                                                                                              |
|  OpenAPI   |   converts a Fern Definition to an [OpenAPI Spec](https://swagger.io/resources/open-api/)    |  fern add openapi   |                [fern-openapi](https://github.com/fern-api/fern-openapi)                |
|            |                                                                                              |
