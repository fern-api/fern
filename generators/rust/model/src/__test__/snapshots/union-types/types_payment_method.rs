use crate::types_credit_card::CreditCard;
use crate::types_bank_transfer::BankTransfer;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum PaymentMethod {
        Cash,

        #[serde(rename = "credit_card")]
        CreditCard {
            #[serde(flatten)]
            data: CreditCard,
        },

        #[serde(rename = "bank_transfer")]
        BankTransfer {
            #[serde(flatten)]
            data: BankTransfer,
        },
}
