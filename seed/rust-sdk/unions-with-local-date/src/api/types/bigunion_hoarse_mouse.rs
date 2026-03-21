pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct HoarseMouse {
    #[serde(default)]
    pub value: String,
}

impl HoarseMouse {
    pub fn builder() -> HoarseMouseBuilder {
        HoarseMouseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct HoarseMouseBuilder {
    value: Option<String>,
}

impl HoarseMouseBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`HoarseMouse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](HoarseMouseBuilder::value)
    pub fn build(self) -> Result<HoarseMouse, BuildError> {
        Ok(HoarseMouse {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
