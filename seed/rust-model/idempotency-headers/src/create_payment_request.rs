pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePaymentRequest {
    #[serde(default)]
    pub amount: i64,
    pub currency: Currency,
}
