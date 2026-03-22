pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PaymentInfo {
    #[serde(default)]
    pub amount: String,
    #[serde(default)]
    pub currency: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

impl PaymentInfo {
    pub fn builder() -> PaymentInfoBuilder {
        PaymentInfoBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaymentInfoBuilder {
    amount: Option<String>,
    currency: Option<String>,
    description: Option<String>,
}

impl PaymentInfoBuilder {
    pub fn amount(mut self, value: impl Into<String>) -> Self {
        self.amount = Some(value.into());
        self
    }

    pub fn currency(mut self, value: impl Into<String>) -> Self {
        self.currency = Some(value.into());
        self
    }

    pub fn description(mut self, value: impl Into<String>) -> Self {
        self.description = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PaymentInfo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`amount`](PaymentInfoBuilder::amount)
    /// - [`currency`](PaymentInfoBuilder::currency)
    pub fn build(self) -> Result<PaymentInfo, BuildError> {
        Ok(PaymentInfo {
            amount: self.amount.ok_or_else(|| BuildError::missing_field("amount"))?,
            currency: self.currency.ok_or_else(|| BuildError::missing_field("currency"))?,
            description: self.description,
        })
    }
}
