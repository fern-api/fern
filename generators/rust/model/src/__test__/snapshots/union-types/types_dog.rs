pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesDog {
    pub name: String,
    pub breed: String,
    pub age: i64,
}