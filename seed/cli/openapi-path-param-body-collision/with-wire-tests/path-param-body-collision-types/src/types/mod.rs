//! Request and response types for the Path Param Body Collision
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 2 types for API operations

pub mod update_profile_identifier_response;
pub mod identifier_update;

pub use update_profile_identifier_response::UpdateProfileIdentifierResponse;
pub use identifier_update::IdentifierUpdate;

