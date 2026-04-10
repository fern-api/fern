pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CreatePaymentRequest {
    #[serde(default)]
    pub amount: i64,
    pub currency: Currency,
}

impl CreatePaymentRequest {
    pub fn builder() -> CreatePaymentRequestBuilder {
        <CreatePaymentRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreatePaymentRequestBuilder {
    amount: Option<i64>,
    currency: Option<Currency>,
}

impl CreatePaymentRequestBuilder {
    pub fn amount(mut self, value: i64) -> Self {
        self.amount = Some(value);
        self
    }

    pub fn currency(mut self, value: Currency) -> Self {
        self.currency = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreatePaymentRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`amount`](CreatePaymentRequestBuilder::amount)
    /// - [`currency`](CreatePaymentRequestBuilder::currency)
    pub fn build(self) -> Result<CreatePaymentRequest, BuildError> {
        Ok(CreatePaymentRequest {
            amount: self.amount.ok_or_else(|| BuildError::missing_field("amount"))?,
            currency: self.currency.ok_or_else(|| BuildError::missing_field("currency"))?,
        })
    }
}

