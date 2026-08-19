use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Cat {
    pub name: String,
    pub is_indoor: bool,
    pub lives_remaining: i32,
}