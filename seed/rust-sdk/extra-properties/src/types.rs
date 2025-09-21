use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Failure {
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub name: String, // TODO: Implement proper type
}

