use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyBasedErrorTestBody {
    pub message: String, // TODO: Implement proper type
}

