pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlantEventBase {
    #[serde(default)]
    pub occurred_at: String,
}

impl PlantEventBase {
    pub fn builder() -> PlantEventBaseBuilder {
        <PlantEventBaseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlantEventBaseBuilder {
    occurred_at: Option<String>,
}

impl PlantEventBaseBuilder {
    pub fn occurred_at(mut self, value: impl Into<String>) -> Self {
        self.occurred_at = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PlantEventBase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`occurred_at`](PlantEventBaseBuilder::occurred_at)
    pub fn build(self) -> Result<PlantEventBase, BuildError> {
        Ok(PlantEventBase {
            occurred_at: self.occurred_at.ok_or_else(|| BuildError::missing_field("occurred_at"))?,
        })
    }
}
