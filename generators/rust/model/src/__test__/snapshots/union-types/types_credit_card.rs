pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesCreditCard {
    pub card_number: String,
    pub expiry_date: String,
}