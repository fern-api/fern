//! Request and response types for the Users API (v1)
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 3 types for data representation

pub mod v_1_user_v_1;
pub mod v_2_user_v_2_profile;
pub mod v_2_user_v_2;
pub mod list_users_query_request;

pub use v_1_user_v_1::UserV1;
pub use v_2_user_v_2_profile::UserV2Profile;
pub use v_2_user_v_2::UserV2;
pub use list_users_query_request::ListUsersQueryRequest;

