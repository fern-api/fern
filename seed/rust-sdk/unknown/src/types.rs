use serde::{Deserialize, Serialize};

pub type MyAlias = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MyObject {
    pub unknown: String, // TODO: Implement proper type
}

