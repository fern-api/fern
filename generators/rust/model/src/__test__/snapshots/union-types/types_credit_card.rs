pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreditCard {
    #[serde(default)]
    pub card_number: String,
    #[serde(default)]
    pub expiry_date: String,
}

impl CreditCard {
    pub fn builder() -> CreditCardBuilder {
        CreditCardBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreditCardBuilder {
    card_number: Option<String>,
    expiry_date: Option<String>,
}

impl CreditCardBuilder {
    pub fn card_number(mut self, value: impl Into<String>) -> Self {
        self.card_number = Some(value.into());
        self
    }

    pub fn expiry_date(mut self, value: impl Into<String>) -> Self {
        self.expiry_date = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreditCard`].
    /// This method will fail if any of the following fields are not set:
    /// - [`card_number`](CreditCardBuilder::card_number)
    /// - [`expiry_date`](CreditCardBuilder::expiry_date)
    pub fn build(self) -> Result<CreditCard, BuildError> {
        Ok(CreditCard {
            card_number: self.card_number.ok_or_else(|| BuildError::missing_field("card_number"))?,
            expiry_date: self.expiry_date.ok_or_else(|| BuildError::missing_field("expiry_date"))?,
        })
    }
}
