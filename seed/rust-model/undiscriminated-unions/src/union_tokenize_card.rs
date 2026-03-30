pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenizeCard {
    #[serde(default)]
    pub method: String,
    #[serde(rename = "cardNumber")]
    #[serde(default)]
    pub card_number: String,
}

impl TokenizeCard {
    pub fn builder() -> TokenizeCardBuilder {
        <TokenizeCardBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TokenizeCardBuilder {
    method: Option<String>,
    card_number: Option<String>,
}

impl TokenizeCardBuilder {
    pub fn method(mut self, value: impl Into<String>) -> Self {
        self.method = Some(value.into());
        self
    }

    pub fn card_number(mut self, value: impl Into<String>) -> Self {
        self.card_number = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TokenizeCard`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method`](TokenizeCardBuilder::method)
    /// - [`card_number`](TokenizeCardBuilder::card_number)
    pub fn build(self) -> Result<TokenizeCard, BuildError> {
        Ok(TokenizeCard {
            method: self.method.ok_or_else(|| BuildError::missing_field("method"))?,
            card_number: self.card_number.ok_or_else(|| BuildError::missing_field("card_number"))?,
        })
    }
}
