pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaymentRequest {
    #[serde(rename = "paymentMethod")]
    pub payment_method: PaymentMethodUnion,
}
