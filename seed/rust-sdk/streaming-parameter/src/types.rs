use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegularResponse {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamResponse {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

