//! Request and response types for the FileUpload
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 8 types for API operations
//! - **Model Types**: 7 types for data representation

pub mod service_id;
pub mod service_my_object_with_optional;
pub mod service_my_alias_object;
pub mod service_my_collection_alias_object;
pub mod service_my_object;
pub mod service_object_type;
pub mod service_my_inline_type;
pub mod post_request;
pub mod just_file_request;
pub mod just_file_with_query_params_request;
pub mod with_content_type_request;
pub mod with_form_encoding_request;
pub mod with_form_encoded_containers_request;
pub mod optional_args_request;
pub mod with_inline_type_request;

pub use service_id::Id;
pub use service_my_object_with_optional::MyObjectWithOptional;
pub use service_my_alias_object::MyAliasObject;
pub use service_my_collection_alias_object::MyCollectionAliasObject;
pub use service_my_object::MyObject;
pub use service_object_type::ObjectType;
pub use service_my_inline_type::MyInlineType;
pub use post_request::PostRequest;
pub use just_file_request::JustFileRequest;
pub use just_file_with_query_params_request::JustFileWithQueryParamsRequest;
pub use with_content_type_request::WithContentTypeRequest;
pub use with_form_encoding_request::WithFormEncodingRequest;
pub use with_form_encoded_containers_request::WithFormEncodedContainersRequest;
pub use optional_args_request::OptionalArgsRequest;
pub use with_inline_type_request::WithInlineTypeRequest;

