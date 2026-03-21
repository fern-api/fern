pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DiligentDeal {
    #[serde(default)]
    pub value: String,
}

impl DiligentDeal {
    pub fn builder() -> DiligentDealBuilder {
        DiligentDealBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DiligentDealBuilder {
    value: Option<String>,
}

impl DiligentDealBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DiligentDeal`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](DiligentDealBuilder::value)
    pub fn build(self) -> Result<DiligentDeal, BuildError> {
        Ok(DiligentDeal {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
