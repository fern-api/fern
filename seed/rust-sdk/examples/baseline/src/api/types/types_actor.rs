pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Actor {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: String,
}

impl Actor {
    pub fn builder() -> ActorBuilder {
        <ActorBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ActorBuilder {
    name: Option<String>,
    id: Option<String>,
}

impl ActorBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Actor`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](ActorBuilder::name)
    /// - [`id`](ActorBuilder::id)
    pub fn build(self) -> Result<Actor, BuildError> {
        Ok(Actor {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
        })
    }
}
