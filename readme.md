# Fern

</p>

Fern was developed as an open-source alternative to OpenAPI and is currently in beta.

Define your API in YAML and Fern will generate type-safe clients for Java and TypeScript.

## Example

The following YAML file defines a Food Delivery API.

```yaml
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
                getOrderStatus:
                    origin: client
                    body: OrderId
                    response:
                        properties:
                            orderStatus: OrderStatus
                            etaInMinutes: integer
                        # we're expecting multiple updates over time, not just a single response
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

## Contributing

The team welcomes contributions! To make code changes to one of the Fern repos:

-   Fork the repo and make a branch
-   Write your code
-   Open a PR (optionally linking to a Github issue)

## License

This tooling is made available under the [Apache 2.0 License] (<https://www.apache.org/licenses/LICENSE-2.0>).
