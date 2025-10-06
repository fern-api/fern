pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesBankTransfer {
    pub account_number: String,
    pub routing_number: String,
}