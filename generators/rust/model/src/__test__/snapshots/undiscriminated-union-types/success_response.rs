use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SuccessResponse {
    pub data: String,
    pub status: i32,
}