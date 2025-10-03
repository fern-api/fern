pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Dog {
    pub name: String,
    pub breed: String,
    pub age: i64,
}