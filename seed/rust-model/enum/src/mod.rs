//! Request and response types for the enum
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations
//! - **Model Types**: 8 types for data representation

pub mod operand;
pub mod color;
pub mod color_or_operand;
pub mod forward_compatible_enum;
pub mod enum_with_special_characters;
pub mod enum_with_custom;
pub mod special_enum;
pub mod status;
pub mod inlined_request_send_request;
pub mod multipartform_request;
pub mod send_query_request;
pub mod sendlist_query_request;

pub use operand::Operand;
pub use color::Color;
pub use color_or_operand::ColorOrOperand;
pub use forward_compatible_enum::ForwardCompatibleEnum;
pub use enum_with_special_characters::EnumWithSpecialCharacters;
pub use enum_with_custom::EnumWithCustom;
pub use special_enum::SpecialEnum;
pub use status::Status;
pub use inlined_request_send_request::InlinedRequestSendRequest;
pub use multipartform_request::MultipartformRequest;
pub use send_query_request::SendQueryRequest;
pub use sendlist_query_request::SendlistQueryRequest;

