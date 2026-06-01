pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum PaymentMethod {
        #[serde(rename = "cash")]
        #[non_exhaustive]
        Cash {},

        #[serde(rename = "credit_card")]
        #[non_exhaustive]
        CreditCard {
            #[serde(default)]
            card_number: String,
            #[serde(default)]
            expiry_date: String,
        },

        #[serde(rename = "bank_transfer")]
        #[non_exhaustive]
        BankTransfer {
            #[serde(default)]
            account_number: String,
            #[serde(default)]
            routing_number: String,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl PaymentMethod {
    pub fn cash() -> Self {
        Self::Cash {}
    }

    pub fn credit_card(card_number: String, expiry_date: String) -> Self {
        Self::CreditCard { card_number, expiry_date }
    }

    pub fn bank_transfer(account_number: String, routing_number: String) -> Self {
        Self::BankTransfer { account_number, routing_number }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
