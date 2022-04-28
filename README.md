# Fern

Fern is an open source framework that makes it easier to build APIs.

Fern allows you to

1. Define a source-of-truth for your API
2. Autogenerate idiomatic & typesafe clients and servers
3. Supports WebSocket and REST APIs
4. Easily manage backwards compatiblity

Fern is interoperable with Open API so you are never locked in.

## Example Spec

```
ids:
  - MenuItemId
  - name: OrderId
    type: long

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
