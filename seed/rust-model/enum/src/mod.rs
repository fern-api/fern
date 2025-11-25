//! Request and response types for the Enum
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations
//! - **Model Types**: 7 types for data representation

pub mod operand;
pub mod color;
pub mod color_or_operand;
pub mod enum_with_special_characters;
pub mod enum_with_custom;
pub mod special_enum;
pub mod unknown_status;
pub mod send_enum_inlined_request;
pub mod multipart_form_request;
pub mod send_query_request;
pub mod send_list_query_request;

pub use operand::Operand;
pub use color::Color;
pub use color_or_operand::ColorOrOperand;
pub use enum_with_special_characters::EnumWithSpecialCharacters;
pub use enum_with_custom::EnumWithCustom;
pub use special_enum::SpecialEnum;
pub use unknown_status::Status;
pub use send_enum_inlined_request::SendEnumInlinedRequest;
pub use multipart_form_request::MultipartFormRequest;
pub use send_query_request::SendQueryRequest;
pub use send_list_query_request::SendListQueryRequest;

