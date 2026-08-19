//! Serde helpers, shared with the rest of the generated workspace.
//!
//! Re-exported from the core crate so that this crate's
//! `#[serde(with = "crate::core::...")]` attributes resolve without each
//! crate compiling its own copy of them.

pub use shared_types_cli_types_core::core::flexible_datetime;
pub use shared_types_cli_types_core::core::base64_bytes;
pub use shared_types_cli_types_core::core::bigint_string;
pub use shared_types_cli_types_core::core::number_serializers;
