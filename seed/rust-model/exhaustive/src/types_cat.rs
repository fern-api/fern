pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TypesCat {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "likesToMeow")]
    #[serde(default)]
    pub likes_to_meow: bool,
}

impl TypesCat {
    pub fn builder() -> TypesCatBuilder {
        <TypesCatBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesCatBuilder {
    name: Option<String>,
    likes_to_meow: Option<bool>,
}

impl TypesCatBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn likes_to_meow(mut self, value: bool) -> Self {
        self.likes_to_meow = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesCat`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](TypesCatBuilder::name)
    /// - [`likes_to_meow`](TypesCatBuilder::likes_to_meow)
    pub fn build(self) -> Result<TypesCat, BuildError> {
        Ok(TypesCat {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            likes_to_meow: self.likes_to_meow.ok_or_else(|| BuildError::missing_field("likes_to_meow"))?,
        })
    }
}
