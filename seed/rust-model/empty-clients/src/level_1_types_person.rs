use crate::level_1_level_2_types_address::Address;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Person {
    pub name: String,
    pub address: Address,
}