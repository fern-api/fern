pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Money {
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers")]
    pub amount: f64,
    #[serde(default)]
    pub currency: String,
}

impl Money {
    pub fn builder() -> MoneyBuilder {
        <MoneyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MoneyBuilder {
    amount: Option<f64>,
    currency: Option<String>,
}

impl MoneyBuilder {
    pub fn amount(mut self, value: f64) -> Self {
        self.amount = Some(value);
        self
    }

    pub fn currency(mut self, value: impl Into<String>) -> Self {
        self.currency = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Money`].
    /// This method will fail if any of the following fields are not set:
    /// - [`amount`](MoneyBuilder::amount)
    /// - [`currency`](MoneyBuilder::currency)
    pub fn build(self) -> Result<Money, BuildError> {
        Ok(Money {
            amount: self.amount.ok_or_else(|| BuildError::missing_field("amount"))?,
            currency: self.currency.ok_or_else(|| BuildError::missing_field("currency"))?,
        })
    }
}
