pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Cat {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "likesToMeow")]
    #[serde(default)]
    pub likes_to_meow: bool,
}

impl Cat {
    pub fn builder() -> CatBuilder {
        CatBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CatBuilder {
    name: Option<String>,
    likes_to_meow: Option<bool>,
}

impl CatBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn likes_to_meow(mut self, value: bool) -> Self {
        self.likes_to_meow = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Cat`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CatBuilder::name)
    /// - [`likes_to_meow`](CatBuilder::likes_to_meow)
    pub fn build(self) -> Result<Cat, BuildError> {
        Ok(Cat {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            likes_to_meow: self.likes_to_meow.ok_or_else(|| BuildError::missing_field("likes_to_meow"))?,
        })
    }
}
