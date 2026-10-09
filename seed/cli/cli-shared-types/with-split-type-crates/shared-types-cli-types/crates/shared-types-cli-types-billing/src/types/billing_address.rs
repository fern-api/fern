pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BillingAddress {
    #[serde(default)]
    pub line1: String,
    #[serde(rename = "postalCode")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub postal_code: Option<String>,
}

impl BillingAddress {
    pub fn builder() -> BillingAddressBuilder {
        <BillingAddressBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BillingAddressBuilder {
    line1: Option<String>,
    postal_code: Option<String>,
}

impl BillingAddressBuilder {
    pub fn line1(mut self, value: impl Into<String>) -> Self {
        self.line1 = Some(value.into());
        self
    }

    pub fn postal_code(mut self, value: impl Into<String>) -> Self {
        self.postal_code = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BillingAddress`].
    /// This method will fail if any of the following fields are not set:
    /// - [`line1`](BillingAddressBuilder::line1)
    pub fn build(self) -> Result<BillingAddress, BuildError> {
        Ok(BillingAddress {
            line1: self.line1.ok_or_else(|| BuildError::missing_field("line1"))?,
            postal_code: self.postal_code,
        })
    }
}
