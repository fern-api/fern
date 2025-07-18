use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamedCompletion {
    pub delta: String, // TODO: Implement proper type
    pub tokens: String, // TODO: Implement proper type
}

