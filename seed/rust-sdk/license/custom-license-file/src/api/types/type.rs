pub use crate::prelude::*;

/// A simple type with just a name.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Type {
    #[serde(default)]
    pub name: String,
}

impl Type {
    pub fn builder() -> TypeBuilder {
        <TypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypeBuilder {
    name: Option<String>,
}

impl TypeBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Type`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](TypeBuilder::name)
    pub fn build(self) -> Result<Type, BuildError> {
        Ok(Type {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
