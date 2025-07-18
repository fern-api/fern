use serde::{Deserialize, Serialize};

pub type AliasType = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parent {
    pub parent: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Child {
    pub child: String, // TODO: Implement proper type
}

