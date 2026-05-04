pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct OrderCompletedPayload {
    #[serde(rename = "orderId")]
    #[serde(default)]
    pub order_id: String,
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers")]
    pub total: f64,
    #[serde(default)]
    pub currency: String,
}

impl OrderCompletedPayload {
    pub fn builder() -> OrderCompletedPayloadBuilder {
        <OrderCompletedPayloadBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OrderCompletedPayloadBuilder {
    order_id: Option<String>,
    total: Option<f64>,
    currency: Option<String>,
}

impl OrderCompletedPayloadBuilder {
    pub fn order_id(mut self, value: impl Into<String>) -> Self {
        self.order_id = Some(value.into());
        self
    }

    pub fn total(mut self, value: f64) -> Self {
        self.total = Some(value);
        self
    }

    pub fn currency(mut self, value: impl Into<String>) -> Self {
        self.currency = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`OrderCompletedPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`order_id`](OrderCompletedPayloadBuilder::order_id)
    /// - [`total`](OrderCompletedPayloadBuilder::total)
    /// - [`currency`](OrderCompletedPayloadBuilder::currency)
    pub fn build(self) -> Result<OrderCompletedPayload, BuildError> {
        Ok(OrderCompletedPayload {
            order_id: self
                .order_id
                .ok_or_else(|| BuildError::missing_field("order_id"))?,
            total: self
                .total
                .ok_or_else(|| BuildError::missing_field("total"))?,
            currency: self
                .currency
                .ok_or_else(|| BuildError::missing_field("currency"))?,
        })
    }
}
