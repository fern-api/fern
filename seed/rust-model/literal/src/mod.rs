//! Request and response types for the Literal
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 5 types for API operations
//! - **Model Types**: 10 types for data representation

pub mod send_response;
pub mod inlined_some_aliased_literal;
pub mod inlined_a_top_level_literal;
pub mod inlined_a_nested_literal;
pub mod inlined_discriminated_literal;
pub mod inlined_undiscriminated_literal;
pub mod query_alias_to_prompt;
pub mod query_alias_to_stream;
pub mod reference_send_request;
pub mod reference_container_object;
pub mod reference_nested_object_with_literals;
pub mod reference_some_literal;
pub mod send_literals_in_headers_request;
pub mod send_literals_inlined_request;
pub mod send_query_request;

pub use send_response::SendResponse;
pub use inlined_some_aliased_literal::SomeAliasedLiteral;
pub use inlined_a_top_level_literal::ATopLevelLiteral;
pub use inlined_a_nested_literal::ANestedLiteral;
pub use inlined_discriminated_literal::DiscriminatedLiteral;
pub use inlined_undiscriminated_literal::UndiscriminatedLiteral;
pub use query_alias_to_prompt::AliasToPrompt;
pub use query_alias_to_stream::AliasToStream;
pub use reference_send_request::SendRequest;
pub use reference_container_object::ContainerObject;
pub use reference_nested_object_with_literals::NestedObjectWithLiterals;
pub use reference_some_literal::SomeLiteral;
pub use send_literals_in_headers_request::SendLiteralsInHeadersRequest;
pub use send_literals_inlined_request::SendLiteralsInlinedRequest;
pub use send_query_request::SendQueryRequest;

