use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PropertyBasedErrorTestBody {
    pub message: String,
}