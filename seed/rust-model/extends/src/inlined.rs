use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Inlined {
    pub unique: String,
    pub name: String,
    pub docs: String,
}