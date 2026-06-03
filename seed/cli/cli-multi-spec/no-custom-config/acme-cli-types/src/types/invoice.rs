pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Invoice {
    #[serde(default)]
    pub id: String,
    #[serde(rename = "amountCents")]
    #[serde(default)]
    pub amount_cents: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub currency: Option<String>,
}

impl Invoice {
    pub fn builder() -> InvoiceBuilder {
        <InvoiceBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InvoiceBuilder {
    id: Option<String>,
    amount_cents: Option<i64>,
    currency: Option<String>,
}

impl InvoiceBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn amount_cents(mut self, value: i64) -> Self {
        self.amount_cents = Some(value);
        self
    }

    pub fn currency(mut self, value: impl Into<String>) -> Self {
        self.currency = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Invoice`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](InvoiceBuilder::id)
    /// - [`amount_cents`](InvoiceBuilder::amount_cents)
    pub fn build(self) -> Result<Invoice, BuildError> {
        Ok(Invoice {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            amount_cents: self.amount_cents.ok_or_else(|| BuildError::missing_field("amount_cents"))?,
            currency: self.currency,
        })
    }
}
