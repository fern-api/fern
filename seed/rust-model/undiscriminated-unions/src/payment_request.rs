pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaymentRequest {
    #[serde(rename = "paymentMethod")]
    pub payment_method: PaymentMethodUnion,
}
