use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsernameCursor {
    pub cursor: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsernamePage {
    pub after: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
}

