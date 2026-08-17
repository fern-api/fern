pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Invoice {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub total: Money,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<BillingAddress>,
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
    total: Option<Money>,
    address: Option<BillingAddress>,
}

impl InvoiceBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn total(mut self, value: Money) -> Self {
        self.total = Some(value);
        self
    }

    pub fn address(mut self, value: BillingAddress) -> Self {
        self.address = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Invoice`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](InvoiceBuilder::id)
    /// - [`total`](InvoiceBuilder::total)
    pub fn build(self) -> Result<Invoice, BuildError> {
        Ok(Invoice {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            total: self.total.ok_or_else(|| BuildError::missing_field("total"))?,
            address: self.address,
        })
    }
}
