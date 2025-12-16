//! Request and response types for the PathParameters
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations
//! - **Model Types**: 2 types for data representation

pub mod organizations_organization;
pub mod user_user;
pub mod search_organizations_query_request;
pub mod search_users_query_request;

pub use organizations_organization::Organization;
pub use user_user::User;
pub use search_organizations_query_request::SearchOrganizationsQueryRequest;
pub use search_users_query_request::SearchUsersQueryRequest;

