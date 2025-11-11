//! Prelude module for convenient imports
//!
//! This module re-exports the most commonly used types and traits.
//! Import it with: `use seed_trace::prelude::*;`

// Client and configuration
pub use crate::config::ClientConfig;
pub use crate::core::{HttpClient, RequestOptions};
pub use crate::error::ApiError;

// Main client and resource clients
pub use crate::api::*;

// Re-export commonly used external types
pub use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
pub use ordered_float::OrderedFloat;
pub use serde::{Deserialize, Serialize};
pub use serde_json::{json, Value};
pub use std::collections::{HashMap, HashSet};
pub use std::fmt;
pub use uuid::Uuid;
