//! Request and response types for the Nested Component Refs
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 10 types for API operations
//! - **Model Types**: 6 types for data representation

pub mod orders_create_orders_request_ship_to;
pub mod orders_create_orders_request_lines_item;
pub mod orders_create_orders_response;
pub mod shipments_create_shipments_request_destination;
pub mod shipments_create_shipments_request_items_item;
pub mod models_address;
pub mod models_line_item;
pub mod models_order_request_ship_to;
pub mod models_order_request_lines_item;
pub mod models_order_request;
pub mod models_order;
pub mod models;
pub mod shipment_destination;
pub mod shipment;
pub mod create_orders_request;
pub mod create_shipments_request;

pub use orders_create_orders_request_ship_to::CreateOrdersRequestShipTo;
pub use orders_create_orders_request_lines_item::CreateOrdersRequestLinesItem;
pub use orders_create_orders_response::CreateOrdersResponse;
pub use shipments_create_shipments_request_destination::CreateShipmentsRequestDestination;
pub use shipments_create_shipments_request_items_item::CreateShipmentsRequestItemsItem;
pub use models_address::ModelsAddress;
pub use models_line_item::ModelsLineItem;
pub use models_order_request_ship_to::ModelsOrderRequestShipTo;
pub use models_order_request_lines_item::ModelsOrderRequestLinesItem;
pub use models_order_request::ModelsOrderRequest;
pub use models_order::ModelsOrder;
pub use models::Models;
pub use shipment_destination::ShipmentDestination;
pub use shipment::Shipment;
pub use create_orders_request::CreateOrdersRequest;
pub use create_shipments_request::CreateShipmentsRequest;

