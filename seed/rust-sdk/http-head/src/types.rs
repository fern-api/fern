use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub name: String, // TODO: Implement proper type
    pub tags: String, // TODO: Implement proper type
}

