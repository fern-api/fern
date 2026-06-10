//! Request and response types for the Query Parameters API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod search_request_neighbor;
pub mod search_request_neighbor_required;
pub mod search_response;
pub mod user;
pub mod nested_user;
pub mod search_query_request;

pub use search_request_neighbor::SearchRequestNeighbor;
pub use search_request_neighbor_required::SearchRequestNeighborRequired;
pub use search_response::SearchResponse;
pub use user::User;
pub use nested_user::NestedUser;
pub use search_query_request::SearchQueryRequest;

