pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Level1Level2TypesPerson {
    pub name: String,
    pub address: Level1Level2TypesAddress,
}