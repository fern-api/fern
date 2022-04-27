# Fern

</p>

_Fern is an opinionated tool to define APIs once and generate client/server interfaces in multiple languages._

Fern was developed as an open-source alternative to OpenAPI and is currently in beta.

Define your API once and then Fern will generate clients for Java, TypeScript, and Python etc. The generated interfaces provide type-safe abstractions.

**See an [example below](#example) to define your first Fern API.**

## Features

- Enables teams to work together across many languages
- Eliminates an entire class of serialization bugs
- Abstracts away low-level details behind ergonomic interfaces
- Expressive language to model your domain (enums, union types, maps, lists, sets)
- Helps preserve backwards compatibility (old clients can talk to new servers)
- Supports incremental switchover from existing JSON/HTTP servers
- Zero config (works out of the box)

## Ecosystem

The Fern compiler reads API definitions written in the concise, [human-readable YML format](/docs/spec/fern_definitions.md) and produces a JSON-based [intermediate representation](/docs/spec/intermediate_representation.md) (IR).

_Fern generators_ read IR and produce code in the target language. The associated libraries provide client and server implementations. Each generator is distributed as a CLI that conforms to [RFC002](/docs/rfc/002-contract-for-fern-generators.md):

| Language | Generator | Libraries | Examples |
|--------------------|-------------------------------|-|-|
| Java | [fern-java](https://github.com/fern-api/fern-java) | [fern-java-runtime](https://github.com/fern-api/fern-java-runtime) | [fern-java-example](https://github.com/fern-api/fern-java-example) |
| TypeScript | [fern-typescript](https://github.com/fern-api/fern-typescript) | [fern-typescript-runtime](https://github.com/fern-api/fern-typescript-runtime) | [fern-typescript-example](https://github.com/palantir/fern-typescript-example) |

The [gradle-fern](https://github.com/fern-api/gradle-fern) _build tool_ is the recommended way of interacting with the Fern ecosystem.

The [fern-verification](https://github.com/fern-api/fern-verification) tools allow Fern generator authors to verify that their generators and libraries produce code that complies with the [wire spec](/docs/spec/wire.md).

## Example

The following YAML file defines a simple Food Delivery API. (See [concepts](/docs/concepts.md))

```yaml
id:
    MenuId: string
    OrderId: string
    DriverId: string
    

objects:
    MenuItem:
        fields:
            name: string
            menu_id: menuId
            price: double
    OrderResponse:
        fields:
            order_id: orderId
            subtotal: double
            tax: double
            tip: <optional>double
            order_total: double
            driver: driverId
    DeliveryEstimateResponse:
        fields:
            order_id: orderId
            estimated_delivery_time: integer

services:
    OrderService:
        endpoints:
            newOrder:
                docs: Returns the order price, time of arrival, and driver for a new order.
                http: POST /order/new
                auth: bearer
                body: list<MenuItem>
                returns: OrderResponse
            deliveryEstimate:
                docs: Returns the estimated time of arrival for an existing order.
                http: GET /order/eta
                auth: bearer
                parameters: 
                    orderId
                returns: DeliveryEstimateResponse
            
```

## Contributing

The team welcomes contributions! To make code changes to one of the Fern repos:

- Fork the repo and make a branch
- Write your code (ideally with tests) and make sure the CircleCI build passes
- Open a PR (optionally linking to a Github issue)

If your change affects just one language or client, you'll probably just need to work in one of the following repos.  See the respective CONTRIBUTING documents for how to set up a dev environment.

- [gradle-fern](https://github.com/fern-api/gradle-fern)
- [fern-java](https://github.com/fern-api/fern-java)
- [fern-java-runtime](https://github.com/fern-api/fern-java-runtime)
- [fern-typescript](https://github.com/fern-api/fern-typescript)

## License

This tooling is made available under the [Apache 2.0 License] (https://www.apache.org/licenses/LICENSE-2.0).