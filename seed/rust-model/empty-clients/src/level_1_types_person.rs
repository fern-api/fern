pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Level1TypesPerson {
    pub name: String,
    pub address: Level1TypesAddress,
}
