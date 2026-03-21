pub use crate::prelude::*;

/// A simple type with just a name.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Type {
    #[serde(default)]
    pub id: TypeId,
    #[serde(default)]
    pub name: String,
}

impl Type {
    pub fn builder() -> TypeBuilder {
        TypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeBuilder {
    id: Option<TypeId>,
    name: Option<String>,
}

impl TypeBuilder {
    pub fn id(mut self, value: TypeId) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Type`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](TypeBuilder::id)
    /// - [`name`](TypeBuilder::name)
    pub fn build(self) -> Result<Type, BuildError> {
        Ok(Type {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
