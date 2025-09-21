use serde::{Deserialize, Serialize};

pub type TypeId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Type {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

pub type Object = String; // TODO: Implement proper type

