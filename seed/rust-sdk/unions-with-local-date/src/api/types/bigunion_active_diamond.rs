pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ActiveDiamond {
    #[serde(default)]
    pub value: String,
}

impl ActiveDiamond {
    pub fn builder() -> ActiveDiamondBuilder {
        ActiveDiamondBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ActiveDiamondBuilder {
    value: Option<String>,
}

impl ActiveDiamondBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ActiveDiamond`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](ActiveDiamondBuilder::value)
    pub fn build(self) -> Result<ActiveDiamond, BuildError> {
        Ok(ActiveDiamond {
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
