//! Request and response types for the pagination-custom
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 1 types for data representation

pub mod users_list_response;
pub mod link;
pub mod listwithcustompager_query_request;

pub use users_list_response::UsersListResponse;
pub use link::Link;
pub use listwithcustompager_query_request::ListwithcustompagerQueryRequest;

