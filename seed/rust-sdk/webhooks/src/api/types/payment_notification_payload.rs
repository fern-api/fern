pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PaymentNotificationPayload {
    #[serde(rename = "paymentId")]
    #[serde(default)]
    pub payment_id: String,
    #[serde(default)]
    pub amount: f64,
    #[serde(default)]
    pub status: String,
}

impl PaymentNotificationPayload {
    pub fn builder() -> PaymentNotificationPayloadBuilder {
        PaymentNotificationPayloadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaymentNotificationPayloadBuilder {
    payment_id: Option<String>,
    amount: Option<f64>,
    status: Option<String>,
}

impl PaymentNotificationPayloadBuilder {
    pub fn payment_id(mut self, value: impl Into<String>) -> Self {
        self.payment_id = Some(value.into());
        self
    }

    pub fn amount(mut self, value: f64) -> Self {
        self.amount = Some(value);
        self
    }

    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PaymentNotificationPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`payment_id`](PaymentNotificationPayloadBuilder::payment_id)
    /// - [`amount`](PaymentNotificationPayloadBuilder::amount)
    /// - [`status`](PaymentNotificationPayloadBuilder::status)
    pub fn build(self) -> Result<PaymentNotificationPayload, BuildError> {
        Ok(PaymentNotificationPayload {
            payment_id: self
                .payment_id
                .ok_or_else(|| BuildError::missing_field("payment_id"))?,
            amount: self
                .amount
                .ok_or_else(|| BuildError::missing_field("amount"))?,
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
