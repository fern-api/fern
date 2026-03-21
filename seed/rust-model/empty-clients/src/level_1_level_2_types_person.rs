pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Person {
    #[serde(default)]
    pub name: String,
    pub address: Address,
}