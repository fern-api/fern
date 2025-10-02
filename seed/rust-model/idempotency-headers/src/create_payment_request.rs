use crate::payment_currency::Currency;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePaymentRequest {
    pub amount: i64,
    pub currency: Currency,
}