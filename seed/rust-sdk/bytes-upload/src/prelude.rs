//! Prelude module for convenient imports
//!
//! This module re-exports the most commonly used types and traits.
//! Import it with: `use seed_bytes_upload::prelude::*;`

// Client and configuration
pub use crate::config::ClientConfig;
pub use crate::core::{HttpClient, RequestOptions};
pub use crate::environment::Environment;
pub use crate::error::ApiError;

// Main client and resource clients
pub use crate::api::*;

// Re-export commonly used external types
pub use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
pub use serde::{Deserialize, Serialize};
pub use serde_json::Value;
pub use uuid::Uuid;
