# Fern

</p>

Fern was developed as an open-source alternative to OpenAPI and is currently in beta.

Define your API in YAML and Fern will generate type-safe clients for Java and TypeScript.

## Example

The following YAML file defines a Food Delivery API.

```yaml
ids:
  - RestaurantId
  - MenuItemId
  - name: OrderId
    type: long
  
types:
  Restuarant:
    properties:
      name: string
      restaurantId: RestaurantId
      location: Address
      rating: double
  Address:
    properties:
      streetLine1: string
      streetLine2: string
      city: string
      state: string
      zip: string
      country: string
  MenuItem:
    properties:
      id: MenuItemId
      name: string
      price: double
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
    RestaurantService:
      base-path: /restaurant
      endpoints:
        getNearbyRestaurants:
          docs: Returns a list of restaurants nearby the address.
          method: POST
          path: /nearby
          body: Address
          response: list<Restaurant>
        getMenu:
          docs: Returns the items on a restaurant's menu.
          method: POST
          path: /menu/{RestaurantId}
          query-parameters: RestaurantId
          response: list<menuItem>

    OrderService:
      base-path: /order
      endpoints:
        addItemToCart:
          docs: Adds a menu item to a cart.
          method: POST
          path: /add
          body:
            properties:
              item: menuItem
              quantity: integer
        placeOrder:
          docs: Returns the order price and time of arrival for a new order.
          method: POST
          path: /order/new
          body:
            properties:
              deliveryMethod: DeliveryMethod
              tip: optional<double>
          response: OrderId
          errors: 
            - EmptyCartError
    
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
            - OrderNotFoundError

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

- Fork the repo and make a branch
- Write your code
- Open a PR (optionally linking to a Github issue)

## License

This tooling is made available under the [Apache 2.0 License] (<https://www.apache.org/licenses/LICENSE-2.0>).