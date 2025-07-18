use serde::{Deserialize, Serialize};

pub type UserId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

