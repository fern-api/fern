pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct RefundProcessedPayload {
    #[serde(rename = "refundId")]
    #[serde(default)]
    pub refund_id: String,
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers")]
    pub amount: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

impl RefundProcessedPayload {
    pub fn builder() -> RefundProcessedPayloadBuilder {
        <RefundProcessedPayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RefundProcessedPayloadBuilder {
    refund_id: Option<String>,
    amount: Option<f64>,
    reason: Option<String>,
}

impl RefundProcessedPayloadBuilder {
    pub fn refund_id(mut self, value: impl Into<String>) -> Self {
        self.refund_id = Some(value.into());
        self
    }

    pub fn amount(mut self, value: f64) -> Self {
        self.amount = Some(value);
        self
    }

    pub fn reason(mut self, value: impl Into<String>) -> Self {
        self.reason = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RefundProcessedPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`refund_id`](RefundProcessedPayloadBuilder::refund_id)
    /// - [`amount`](RefundProcessedPayloadBuilder::amount)
    pub fn build(self) -> Result<RefundProcessedPayload, BuildError> {
        Ok(RefundProcessedPayload {
            refund_id: self.refund_id.ok_or_else(|| BuildError::missing_field("refund_id"))?,
            amount: self.amount.ok_or_else(|| BuildError::missing_field("amount"))?,
            reason: self.reason,
        })
    }
}
