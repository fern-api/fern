pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DisloyalValue {
    #[serde(default)]
    pub value: String,
}

impl DisloyalValue {
    pub fn builder() -> DisloyalValueBuilder {
        DisloyalValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DisloyalValueBuilder {
    value: Option<String>,
}

impl DisloyalValueBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DisloyalValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](DisloyalValueBuilder::value)
    pub fn build(self) -> Result<DisloyalValue, BuildError> {
        Ok(DisloyalValue {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
