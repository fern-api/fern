pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PaymentCreateRequest {
    #[serde(default)]
    pub amount: i64,
    pub currency: Currency,
}

impl PaymentCreateRequest {
    pub fn builder() -> PaymentCreateRequestBuilder {
        <PaymentCreateRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PaymentCreateRequestBuilder {
    amount: Option<i64>,
    currency: Option<Currency>,
}

impl PaymentCreateRequestBuilder {
    pub fn amount(mut self, value: i64) -> Self {
        self.amount = Some(value);
        self
    }

    pub fn currency(mut self, value: Currency) -> Self {
        self.currency = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PaymentCreateRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`amount`](PaymentCreateRequestBuilder::amount)
    /// - [`currency`](PaymentCreateRequestBuilder::currency)
    pub fn build(self) -> Result<PaymentCreateRequest, BuildError> {
        Ok(PaymentCreateRequest {
            amount: self.amount.ok_or_else(|| BuildError::missing_field("amount"))?,
            currency: self.currency.ok_or_else(|| BuildError::missing_field("currency"))?,
        })
    }
}

