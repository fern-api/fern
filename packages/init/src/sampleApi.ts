import { RawSchemas } from "@fern-api/syntax-analysis";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";

export async function writeSampleApiToDirectory(dir: string): Promise<void> {
    await writeFile(`${dir}/${ORDER_API_FILENAME}`, yaml.dump(ORDER_API));
    await writeFile(`${dir}/${MENU_API_FILENAME}`, yaml.dump(MENU_API));
}

const ORDER_API_FILENAME = "orders.yml";
const MENU_API_FILENAME = "menu.yml";

const ORDER_API: RawSchemas.RawFernConfigurationSchema = {
    imports: {
        menu: MENU_API_FILENAME,
    },
    ids: [
        {
            name: "OrderId",
            type: "long",
        },
    ],
    types: {
        DeliveryMethod: {
            enum: ["PICKUP", "DELIVERY"],
        },
        OrderStatus: {
            union: {
                pickup: "PickupOrderStatus",
                delivery: "DeliveryOrderStatus",
            },
        },
        PickupOrderStatus: {
            enum: ["PREPARING", "READY_FOR_PICKUP", "PICKED_UP"],
        },
        DeliveryOrderStatus: {
            enum: ["PREPARING", "ON_THE_WAY", "DELIVERED"],
        },
    },
    errors: {
        EmptyCartError: {
            http: {
                statusCode: 400,
            },
        },
    },
    services: {
        http: {
            OrderService: {
                "base-path": "/order",
                endpoints: {
                    addItemToCart: {
                        docs: "Adds a menu item to a cart.",
                        method: "POST",
                        path: "/add",
                        request: {
                            properties: {
                                menuItemId: "menu.MenuItemId",
                                quantity: "integer",
                            },
                        },
                    },
                    placeOrder: {
                        method: "POST",
                        path: "/order/new",
                        request: {
                            properties: {
                                deliveryMethod: "DeliveryMethod",
                                tip: "optional<double>",
                            },
                        },
                        response: "OrderId",
                        errors: {
                            union: {
                                emptyCart: "EmptyCartError",
                            },
                        },
                    },
                },
            },
        },
    },
};

const MENU_API: RawSchemas.RawFernConfigurationSchema = {
    ids: ["RestaurantId", "MenuItemId"],
    types: {
        MenuItem: {
            properties: {
                id: "MenuItemId",
                name: "string",
                description: "optional<string>",
                imageUrl: "optional<string>",
                price: "double",
                recommendedPairings: {
                    type: "list<MenuItemId>",
                    docs: "Other menu items that pair well with this item.",
                },
            },
        },
    },
    services: {
        http: {
            MenuService: {
                "base-path": "/menu",
                endpoints: {
                    getMenu: {
                        docs: "Adds a menu item to a cart.",
                        method: "GET",
                        path: "/{restaurantId}",
                        parameters: {
                            restaurantId: "RestaurantId",
                        },
                        response: "list<MenuItem>",
                    },
                },
            },
        },
    },
};
