pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreditCard {
    pub card_number: String,
    pub expiry_date: String,
}