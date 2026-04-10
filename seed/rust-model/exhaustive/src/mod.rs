//! Request and response types for the exhaustive
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 9 types for API operations
//! - **Model Types**: 27 types for data representation

pub mod endpoints_paginated_response;
pub mod endpoints_error;
pub mod endpoints_error_category;
pub mod endpoints_error_code;
pub mod endpoints_put_response;
pub mod bad_object_request_info;
pub mod types_object_with_docs;
pub mod types_weather_report;
pub mod types_object_with_optional_field;
pub mod types_object_with_required_field;
pub mod types_object_with_map_of_map;
pub mod types_nested_object_with_optional_field;
pub mod types_nested_object_with_required_field;
pub mod types_double_optional;
pub mod types_optional_alias;
pub mod types_object_with_datetime_like_string;
pub mod types_object_with_unknown_field;
pub mod types_object_with_documented_unknown_type;
pub mod types_documented_unknown_type;
pub mod types_map_of_documented_unknown_type;
pub mod types_object_with_mixed_required_and_optional_fields;
pub mod types_object_with_required_nested_object;
pub mod types_animal_zero_animal;
pub mod types_animal_zero;
pub mod types_animal_one_animal;
pub mod types_animal_one;
pub mod types_animal;
pub mod types_dog;
pub mod types_cat;
pub mod types_mixed_type;
pub mod inlined_requests_post_with_object_bodyand_response_request;
pub mod endpoints_pagination_list_items_query_request;
pub mod endpoints_params_get_with_query_query_request;
pub mod endpoints_params_get_with_allow_multiple_query_query_request;
pub mod endpoints_params_get_with_path_and_query_query_request;
pub mod endpoints_params_get_with_inline_path_and_query_query_request;

pub use endpoints_paginated_response::EndpointsPaginatedResponse;
pub use endpoints_error::EndpointsError;
pub use endpoints_error_category::EndpointsErrorCategory;
pub use endpoints_error_code::EndpointsErrorCode;
pub use endpoints_put_response::EndpointsPutResponse;
pub use bad_object_request_info::BadObjectRequestInfo;
pub use types_object_with_docs::TypesObjectWithDocs;
pub use types_weather_report::TypesWeatherReport;
pub use types_object_with_optional_field::TypesObjectWithOptionalField;
pub use types_object_with_required_field::TypesObjectWithRequiredField;
pub use types_object_with_map_of_map::TypesObjectWithMapOfMap;
pub use types_nested_object_with_optional_field::TypesNestedObjectWithOptionalField;
pub use types_nested_object_with_required_field::TypesNestedObjectWithRequiredField;
pub use types_double_optional::TypesDoubleOptional;
pub use types_optional_alias::TypesOptionalAlias;
pub use types_object_with_datetime_like_string::TypesObjectWithDatetimeLikeString;
pub use types_object_with_unknown_field::TypesObjectWithUnknownField;
pub use types_object_with_documented_unknown_type::TypesObjectWithDocumentedUnknownType;
pub use types_documented_unknown_type::TypesDocumentedUnknownType;
pub use types_map_of_documented_unknown_type::TypesMapOfDocumentedUnknownType;
pub use types_object_with_mixed_required_and_optional_fields::TypesObjectWithMixedRequiredAndOptionalFields;
pub use types_object_with_required_nested_object::TypesObjectWithRequiredNestedObject;
pub use types_animal_zero_animal::TypesAnimalZeroAnimal;
pub use types_animal_zero::TypesAnimalZero;
pub use types_animal_one_animal::TypesAnimalOneAnimal;
pub use types_animal_one::TypesAnimalOne;
pub use types_animal::TypesAnimal;
pub use types_dog::TypesDog;
pub use types_cat::TypesCat;
pub use types_mixed_type::TypesMixedType;
pub use inlined_requests_post_with_object_bodyand_response_request::InlinedRequestsPostWithObjectBodyandResponseRequest;
pub use endpoints_pagination_list_items_query_request::EndpointsPaginationListItemsQueryRequest;
pub use endpoints_params_get_with_query_query_request::EndpointsParamsGetWithQueryQueryRequest;
pub use endpoints_params_get_with_allow_multiple_query_query_request::EndpointsParamsGetWithAllowMultipleQueryQueryRequest;
pub use endpoints_params_get_with_path_and_query_query_request::EndpointsParamsGetWithPathAndQueryQueryRequest;
pub use endpoints_params_get_with_inline_path_and_query_query_request::EndpointsParamsGetWithInlinePathAndQueryQueryRequest;

