pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenizeCard {
    #[serde(default)]
    pub method: String,
    #[serde(rename = "cardNumber")]
    #[serde(default)]
    pub card_number: String,
}
