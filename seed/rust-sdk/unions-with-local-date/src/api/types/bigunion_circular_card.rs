pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CircularCard {
    #[serde(default)]
    pub value: String,
}

impl CircularCard {
    pub fn builder() -> CircularCardBuilder {
        CircularCardBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CircularCardBuilder {
    value: Option<String>,
}

impl CircularCardBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CircularCard`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](CircularCardBuilder::value)
    pub fn build(self) -> Result<CircularCard, BuildError> {
        Ok(CircularCard {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
