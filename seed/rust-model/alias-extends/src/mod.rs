//! Request and response types for the AliasExtends
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 1 types for API operations
//! - **Model Types**: 3 types for data representation

pub mod alias_type;
pub mod parent;
pub mod child;
pub mod inlined_child_request;

pub use alias_type::AliasType;
pub use parent::Parent;
pub use child::Child;
pub use inlined_child_request::InlinedChildRequest;

