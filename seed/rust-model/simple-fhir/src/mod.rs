//! Request and response types for the Api
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 7 types for data representation

pub mod memo;
pub mod base_resource;
pub mod resource_list;
pub mod account;
pub mod patient;
pub mod practitioner;
pub mod script;

pub use memo::Memo;
pub use base_resource::BaseResource;
pub use resource_list::ResourceList;
pub use account::Account;
pub use patient::Patient;
pub use practitioner::Practitioner;
pub use script::Script;

