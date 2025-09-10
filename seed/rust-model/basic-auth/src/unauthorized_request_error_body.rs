use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnauthorizedRequestErrorBody {
    pub message: String,
}