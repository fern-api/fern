pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePaymentRequest {
    pub amount: i64,
    pub currency: Currency,
}
