use crate::payment_currency::Currency;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePaymentRequest {
    pub amount: i32,
    pub currency: Currency,
}
