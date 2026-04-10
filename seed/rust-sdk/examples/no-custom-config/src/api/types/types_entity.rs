pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Entity {
    pub r#type: Type,
    #[serde(default)]
    pub name: String,
}

impl Entity {
    pub fn builder() -> EntityBuilder {
        <EntityBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct EntityBuilder {
    r#type: Option<Type>,
    name: Option<String>,
}

impl EntityBuilder {
    pub fn r#type(mut self, value: Type) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Entity`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](EntityBuilder::r#type)
    /// - [`name`](EntityBuilder::name)
    pub fn build(self) -> Result<Entity, BuildError> {
        Ok(Entity {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
