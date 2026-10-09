//! Request and response types for the Test x-fern-global-parameters extension
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod products_search_products_request_config;
pub mod products_search_products_response;
pub mod product;
pub mod search_products_request;

pub use products_search_products_request_config::SearchProductsRequestConfig;
pub use products_search_products_response::SearchProductsResponse;
pub use product::Product;
pub use search_products_request::SearchProductsRequest;

