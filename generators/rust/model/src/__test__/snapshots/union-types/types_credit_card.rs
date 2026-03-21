pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreditCard {
    #[serde(default)]
    pub card_number: String,
    #[serde(default)]
    pub expiry_date: String,
}