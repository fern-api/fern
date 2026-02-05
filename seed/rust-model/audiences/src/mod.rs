//! Request and response types for the Audiences API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations
//! - **Model Types**: 6 types for data representation

pub mod commons_imported;
pub mod folder_a_service_response;
pub mod folder_b_common_foo;
pub mod folder_c_common_folder_c_foo;
pub mod folder_d_service_response;
pub mod foo_importing_type;
pub mod foo_optional_string;
pub mod foo_filtered_type;
pub mod find_request;
pub mod get_direct_thread_query_request;

pub use commons_imported::Imported;
pub use folder_a_service_response::Response;
pub use folder_b_common_foo::Foo;
pub use folder_c_common_folder_c_foo::FolderCFoo;
pub use folder_d_service_response::Response2;
pub use foo_importing_type::ImportingType;
pub use foo_optional_string::OptionalString;
pub use foo_filtered_type::FilteredType;
pub use find_request::FindRequest;
pub use get_direct_thread_query_request::GetDirectThreadQueryRequest;

