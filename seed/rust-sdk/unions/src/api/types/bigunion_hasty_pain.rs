pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HastyPain {
    #[serde(default)]
    pub value: String,
}

impl HastyPain {
    pub fn builder() -> HastyPainBuilder {
        HastyPainBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HastyPainBuilder {
    value: Option<String>,
}

impl HastyPainBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`HastyPain`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](HastyPainBuilder::value)
    pub fn build(self) -> Result<HastyPain, BuildError> {
        Ok(HastyPain {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
