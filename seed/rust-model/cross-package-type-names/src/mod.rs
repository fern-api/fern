//! Request and response types for the CrossPackageTypeNames
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 3 types for API operations
//! - **Model Types**: 5 types for data representation

pub mod commons_imported;
pub mod folder_a_service_response;
pub mod folder_b_common_foo;
pub mod folder_c_common_foo;
pub mod folder_d_service_response;
pub mod foo_importing_type;
pub mod foo_optional_string;
pub mod find_request;

pub use commons_imported::Imported;
pub use folder_a_service_response::Response;
pub use folder_b_common_foo::Foo;
pub use folder_c_common_foo::Foo2;
pub use folder_d_service_response::Response2;
pub use foo_importing_type::ImportingType;
pub use foo_optional_string::OptionalString;
pub use find_request::FindRequest;

