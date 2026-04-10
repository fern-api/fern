//! Request and response types for the literal
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 13 types for API operations
//! - **Model Types**: 16 types for data representation

pub mod headers_headers_send_request_x_endpoint_version;
pub mod inlined_inlined_send_request_prompt;
pub mod inlined_inlined_send_request_context;
pub mod path_path_send_request_id;
pub mod query_query_send_request_prompt;
pub mod query_query_send_request_optional_prompt;
pub mod reference_send_request_prompt;
pub mod reference_send_request_ending;
pub mod send_response;
pub mod some_aliased_literal;
pub mod a_top_level_literal;
pub mod a_nested_literal_my_literal;
pub mod a_nested_literal;
pub mod discriminated_literal_default_name_value;
pub mod discriminated_literal;
pub mod undiscriminated_literal_one;
pub mod undiscriminated_literal_two;
pub mod undiscriminated_literal;
pub mod alias_to_prompt;
pub mod alias_to_stream;
pub mod container_object;
pub mod nested_object_with_literals_literal_1;
pub mod nested_object_with_literals_literal_2;
pub mod nested_object_with_literals;
pub mod some_literal;
pub mod headers_send_request;
pub mod inlined_send_request;
pub mod send_request;
pub mod send_query_request;

pub use headers_headers_send_request_x_endpoint_version::HeadersSendRequestXEndpointVersion;
pub use inlined_inlined_send_request_prompt::InlinedSendRequestPrompt;
pub use inlined_inlined_send_request_context::InlinedSendRequestContext;
pub use path_path_send_request_id::PathSendRequestId;
pub use query_query_send_request_prompt::QuerySendRequestPrompt;
pub use query_query_send_request_optional_prompt::QuerySendRequestOptionalPrompt;
pub use reference_send_request_prompt::SendRequestPrompt;
pub use reference_send_request_ending::SendRequestEnding;
pub use send_response::SendResponse;
pub use some_aliased_literal::SomeAliasedLiteral;
pub use a_top_level_literal::ATopLevelLiteral;
pub use a_nested_literal_my_literal::ANestedLiteralMyLiteral;
pub use a_nested_literal::ANestedLiteral;
pub use discriminated_literal_default_name_value::DiscriminatedLiteralDefaultNameValue;
pub use discriminated_literal::DiscriminatedLiteral;
pub use undiscriminated_literal_one::UndiscriminatedLiteralOne;
pub use undiscriminated_literal_two::UndiscriminatedLiteralTwo;
pub use undiscriminated_literal::UndiscriminatedLiteral;
pub use alias_to_prompt::AliasToPrompt;
pub use alias_to_stream::AliasToStream;
pub use container_object::ContainerObject;
pub use nested_object_with_literals_literal_1::NestedObjectWithLiteralsLiteral1;
pub use nested_object_with_literals_literal_2::NestedObjectWithLiteralsLiteral2;
pub use nested_object_with_literals::NestedObjectWithLiterals;
pub use some_literal::SomeLiteral;
pub use headers_send_request::HeadersSendRequest;
pub use inlined_send_request::InlinedSendRequest;
pub use send_request::SendRequest;
pub use send_query_request::SendQueryRequest;

