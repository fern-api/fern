pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BankTransfer {
    #[serde(default)]
    pub account_number: String,
    #[serde(default)]
    pub routing_number: String,
}

impl BankTransfer {
    pub fn builder() -> BankTransferBuilder {
        BankTransferBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BankTransferBuilder {
    account_number: Option<String>,
    routing_number: Option<String>,
}

impl BankTransferBuilder {
    pub fn account_number(mut self, value: impl Into<String>) -> Self {
        self.account_number = Some(value.into());
        self
    }

    pub fn routing_number(mut self, value: impl Into<String>) -> Self {
        self.routing_number = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`BankTransfer`].
    /// This method will fail if any of the following fields are not set:
    /// - [`account_number`](BankTransferBuilder::account_number)
    /// - [`routing_number`](BankTransferBuilder::routing_number)
    pub fn build(self) -> Result<BankTransfer, BuildError> {
        Ok(BankTransfer {
            account_number: self.account_number.ok_or_else(|| BuildError::missing_field("account_number"))?,
            routing_number: self.routing_number.ok_or_else(|| BuildError::missing_field("routing_number"))?,
        })
    }
}
