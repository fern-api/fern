//! Request and response types for the cross-package-type-names
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 5 types for data representation

pub mod imported;
pub mod folder_a_response;
pub mod folder_b_foo;
pub mod folder_c_foo;
pub mod folder_d_response;
pub mod importing_type;
pub mod optional_string;
pub mod foo_find_request;

pub use imported::Imported;
pub use folder_a_response::FolderAResponse;
pub use folder_b_foo::FolderBFoo;
pub use folder_c_foo::FolderCFoo;
pub use folder_d_response::FolderDResponse;
pub use importing_type::ImportingType;
pub use optional_string::OptionalString;
pub use foo_find_request::FooFindRequest;

