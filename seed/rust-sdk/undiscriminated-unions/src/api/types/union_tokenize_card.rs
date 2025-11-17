pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TokenizeCard {
    pub method: String,
    #[serde(rename = "cardNumber")]
    pub card_number: String,
}
