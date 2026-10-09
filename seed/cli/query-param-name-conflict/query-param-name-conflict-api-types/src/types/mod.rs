//! Request and response types for the Query Param Name Conflict API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod bulk_update_tasks_response;
pub mod bulk_update_tasks_request;

pub use bulk_update_tasks_response::BulkUpdateTasksResponse;
pub use bulk_update_tasks_request::BulkUpdateTasksRequest;

