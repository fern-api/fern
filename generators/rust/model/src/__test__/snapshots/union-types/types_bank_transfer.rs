use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BankTransfer {
    pub account_number: String,
    pub routing_number: String,
}