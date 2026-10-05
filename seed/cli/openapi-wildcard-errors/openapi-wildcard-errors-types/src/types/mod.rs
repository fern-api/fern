//! Request and response types for the openapi-wildcard-errors
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 3 types for data representation

pub mod item;
pub mod item_not_found;
pub mod api_error;
pub mod create_item_request;

pub use item::Item;
pub use item_not_found::ItemNotFound;
pub use api_error::ApiError;
pub use create_item_request::CreateItemRequest;

