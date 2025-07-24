use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Dog {
    pub name: String,
    pub breed: String,
    pub age: i32,
}