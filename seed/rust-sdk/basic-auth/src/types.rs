use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnauthorizedRequestErrorBody {
    pub message: String, // TODO: Implement proper type
}

