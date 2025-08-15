use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreditCard {
    pub card_number: String,
    pub expiry_date: String,
}