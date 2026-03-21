pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GaseousRoad {
    #[serde(default)]
    pub value: String,
}

impl GaseousRoad {
    pub fn builder() -> GaseousRoadBuilder {
        GaseousRoadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GaseousRoadBuilder {
    value: Option<String>,
}

impl GaseousRoadBuilder {
    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GaseousRoad`].
    /// This method will fail if any of the following fields are not set:
    /// - [`value`](GaseousRoadBuilder::value)
    pub fn build(self) -> Result<GaseousRoad, BuildError> {
        Ok(GaseousRoad {
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
