use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Type {
    pub name: String, // TODO: Implement proper type
}

