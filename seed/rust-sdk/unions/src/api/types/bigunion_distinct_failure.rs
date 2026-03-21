pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DistinctFailure {
    #[serde(default)]
    pub value: String,
}

impl DistinctFailure {
    pub fn builder() -> DistinctFailureBuilder {
        DistinctFailureBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DistinctFailureBuilder {
    value: Option<String>,
}

impl DistinctFailureBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DistinctFailure`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](DistinctFailureBuilder::value)
    pub fn build(self) -> Result<DistinctFailure, BuildError> {
        Ok(DistinctFailure {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
