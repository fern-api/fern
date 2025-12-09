//! Request and response types for the Exhaustive
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 7 types for API operations
//! - **Model Types**: 15 types for data representation

pub mod endpoints_put_error;
pub mod endpoints_put_error_category;
pub mod endpoints_put_error_code;
pub mod endpoints_put_put_response;
pub mod general_errors_bad_object_request_info;
pub mod types_docs_object_with_docs;
pub mod types_enum_weather_report;
pub mod types_object_object_with_optional_field;
pub mod types_object_object_with_required_field;
pub mod types_object_object_with_map_of_map;
pub mod types_object_nested_object_with_optional_field;
pub mod types_object_nested_object_with_required_field;
pub mod types_object_double_optional;
pub mod types_object_optional_alias;
pub mod types_union_animal;
pub mod types_union_dog;
pub mod types_union_cat;
pub mod post_with_object_body;
pub mod get_with_query_query_request;
pub mod get_with_allow_multiple_query_query_request;
pub mod get_with_path_and_query_query_request;
pub mod get_with_inline_path_and_query_query_request;

pub use endpoints_put_error::Error;
pub use endpoints_put_error_category::ErrorCategory;
pub use endpoints_put_error_code::ErrorCode;
pub use endpoints_put_put_response::PutResponse;
pub use general_errors_bad_object_request_info::BadObjectRequestInfo;
pub use types_docs_object_with_docs::ObjectWithDocs;
pub use types_enum_weather_report::WeatherReport;
pub use types_object_object_with_optional_field::ObjectWithOptionalField;
pub use types_object_object_with_required_field::ObjectWithRequiredField;
pub use types_object_object_with_map_of_map::ObjectWithMapOfMap;
pub use types_object_nested_object_with_optional_field::NestedObjectWithOptionalField;
pub use types_object_nested_object_with_required_field::NestedObjectWithRequiredField;
pub use types_object_double_optional::DoubleOptional;
pub use types_object_optional_alias::OptionalAlias;
pub use types_union_animal::Animal;
pub use types_union_dog::Dog;
pub use types_union_cat::Cat;
pub use post_with_object_body::PostWithObjectBody;
pub use get_with_query_query_request::GetWithQueryQueryRequest;
pub use get_with_allow_multiple_query_query_request::GetWithAllowMultipleQueryQueryRequest;
pub use get_with_path_and_query_query_request::GetWithPathAndQueryQueryRequest;
pub use get_with_inline_path_and_query_query_request::GetWithInlinePathAndQueryQueryRequest;

