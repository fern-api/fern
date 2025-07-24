use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SendResponse {
    pub message: String,
    pub status: i32,
    pub success: bool,
}