pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BankTransfer {
    #[serde(default)]
    pub account_number: String,
    #[serde(default)]
    pub routing_number: String,
}