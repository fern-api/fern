pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StuntDouble {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "actorOrActressId")]
    #[serde(default)]
    pub actor_or_actress_id: String,
}

impl StuntDouble {
    pub fn builder() -> StuntDoubleBuilder {
        <StuntDoubleBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StuntDoubleBuilder {
    name: Option<String>,
    actor_or_actress_id: Option<String>,
}

impl StuntDoubleBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn actor_or_actress_id(mut self, value: impl Into<String>) -> Self {
        self.actor_or_actress_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StuntDouble`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](StuntDoubleBuilder::name)
    /// - [`actor_or_actress_id`](StuntDoubleBuilder::actor_or_actress_id)
    pub fn build(self) -> Result<StuntDouble, BuildError> {
        Ok(StuntDouble {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            actor_or_actress_id: self.actor_or_actress_id.ok_or_else(|| BuildError::missing_field("actor_or_actress_id"))?,
        })
    }
}
