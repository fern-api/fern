use serde::{Deserialize, Serialize};

pub type Email = String; // TODO: Implement proper type

pub type UserId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub name: String, // TODO: Implement proper type
    pub id: String, // TODO: Implement proper type
    pub tags: String, // TODO: Implement proper type
    pub metadata: String, // TODO: Implement proper type
    pub email: String, // TODO: Implement proper type
    pub favorite_number: String, // TODO: Implement proper type
    pub numbers: String, // TODO: Implement proper type
    pub strings: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub created_at: String, // TODO: Implement proper type
    pub updated_at: String, // TODO: Implement proper type
    pub avatar: String, // TODO: Implement proper type
    pub activated: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
    pub values: String, // TODO: Implement proper type
}

