pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ColorfulCover {
    #[serde(default)]
    pub value: String,
}

impl ColorfulCover {
    pub fn builder() -> ColorfulCoverBuilder {
        ColorfulCoverBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ColorfulCoverBuilder {
    value: Option<String>,
}

impl ColorfulCoverBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ColorfulCover`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](ColorfulCoverBuilder::value)
    pub fn build(self) -> Result<ColorfulCover, BuildError> {
        Ok(ColorfulCover {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
