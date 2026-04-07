pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaymentRequest {
    #[serde(rename = "paymentMethod")]
    pub payment_method: PaymentMethodUnion,
}

impl PaymentRequest {
    pub fn builder() -> PaymentRequestBuilder {
        <PaymentRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaymentRequestBuilder {
    payment_method: Option<PaymentMethodUnion>,
}

impl PaymentRequestBuilder {
    pub fn payment_method(mut self, value: PaymentMethodUnion) -> Self {
        self.payment_method = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PaymentRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`payment_method`](PaymentRequestBuilder::payment_method)
    pub fn build(self) -> Result<PaymentRequest, BuildError> {
        Ok(PaymentRequest {
            payment_method: self.payment_method.ok_or_else(|| BuildError::missing_field("payment_method"))?,
        })
    }
}

