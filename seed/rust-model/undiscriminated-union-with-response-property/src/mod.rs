//! Request and response types for the undiscriminated-union-with-response-property
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod union_response;
pub mod union_list_response;
pub mod my_union;

pub use union_response::UnionResponse;
pub use union_list_response::UnionListResponse;
pub use my_union::MyUnion;

