use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WithMetadata {
    pub metadata: HashMap<String, String>,
}
