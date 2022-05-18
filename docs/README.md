# Fern

What is Fern?

Fern is a compiler.

What is it compiling?

Fern compiles a Fern Definition into server stubs and clients.

What is a Fern Definition?

A Fern Definition is a collection of YAML files that describe:

- A data model
- Services, which communicate messages over a network.

What does Fern do?

- design my API (fern.yml)
- Implement my server (server stubs)
- Use clients for testing (auto-generated)
- Publish SDKs for others to use

Fern is not tied to particular protocols or technologies. This means that Fern:

- communicates over HTTP, WebSocket, and whatever comes next
- encodes using JSON, gRPC, and whatever comes next
- can generate servers and clients in any programming language

**How does it work?**

- Fern uses plugins
- Plugins can convert a Fern Definition into generated code
- Plugins can declare their own plugin points - i.e. plugins can have plugins
- Open source - anyone can write a plugin

One word: plugins.

Plugins put the control in the developer's hands.

You have the opinions not us.

We won't force your hand.

While OpenAPI forces you to write your code generator

Our learnings from OpenAPI are:

- Different languages are better for different

We designed the Fern compiler so that anyone can build on top. Even plugins can have plugins!

We'll never tell you.

The Fern compiler is

Plugins are our secret sauce.

We designed Fern

Our plugin-based compiler means that we make very few assumptions about how data is transferred. And plugins can be written in any language.

Our plugin-based compiler si . **What does this mean?**

Fern is an alternative
OpenAPI
AsyncAPI
Home rolling

Why we're frustrated with OpenAPI.

1. Spec is too flexible (anyOf)
1. Spec is hard for a human to read
1. Codegen sucks, sometimes doesn't even compile
1. Code generators can't have plugins
   - e.g. Auth0
1. No WebSocket support
1. No GraphQL support
1. Must be JSON

Our plugin-based compiler means that are agnostic:

- protocol (HTTP, Websocket)
- Encoding (JSON, buf, xml, custom binary)
- Language (servers and clients in any language)

Use fern to:

- code generation for SDKs (i.e. clients & servers)
- interactive documentation (_e.g. docs.example.com_)

Fern makes it easy to build REST APIs. Fern is open source and interoperable with OpenAPI so you are never locked in.

A **Fern Definition** is an API description format for REST APIs (similar to the OpenAPI Spec) written to be a programming language-agnostic. **Fern Definitions** are written in YAML, allowing humans and computers to understand the capabilities of a service without having to read source code or inspect network requests.

Developers are most successful using Fern when designing their APIs (in YAML) before writing source code.

Use cases for **Fern Definitions** include:

- code generation for SDKs (i.e. clients & servers)

- interactive documentation (_e.g. docs.example.com_)

- generating Postman Collections

## Example Spec

Below we have written out a sample spec for a Food Delivery App.

```yaml
ids:
  - MenuItemId
  - OrderId: long

types:
  DeliveryMethod:
    enum:
      - PICKUP
      - DELIVERY
  OrderStatus:
    union:
      pickup: PickupOrderStatus
      delivery: DeliveryOrderStatus
  PickupOrderStatus:
    enum:
      - PREPARING
      - READY_FOR_PICKUP
      - PICKED_UP
  DeliveryOrderStatus:
    enum:
      - PREPARING
      - ON_THE_WAY
      - DELIVERED

services:
  http:
    OrderService:
      base-path: /order
      endpoints:
        addItemToCart:
          docs: Adds a menu item to a cart.
          method: POST
          path: /add
          request:
            properties:
              menuItemId: MenuItemId
              quantity: integer
        placeOrder:
          method: POST
          path: /order/new
          request:
            properties:
              deliveryMethod: DeliveryMethod
              tip: optional<double>
          response: OrderId
          errors:
            union:
              emptyCart: EmptyCartError

  websocket:
    OrderStatusChannel:
      messages:
        subscribeToOrderStatus:
          origin: client
          body: OrderId
          response:
            properties:
              orderStatus: OrderStatus
              etaInMinutes: integer
            behavior: ongoing
          errors:
            union:
              notFound: OrderNotFoundError

errors:
  OrderNotFoundError:
    http:
      statusCode: 404
  EmptyCartError:
    http:
      statusCode: 400
```

The app has REST endpoints so that clients can add items to their cart and place orders. It also has a websocket channel where a client can subscribe to updates about an order's ETA.

This spec can be used to generate clients and servers.
