pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Cat {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub is_indoor: bool,
    #[serde(default)]
    pub lives_remaining: i64,
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
    is_indoor: Option<bool>,
    lives_remaining: Option<i64>,
}

impl CatBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn is_indoor(mut self, value: bool) -> Self {
        self.is_indoor = Some(value);
        self
    }

    pub fn lives_remaining(mut self, value: i64) -> Self {
        self.lives_remaining = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Cat`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](CatBuilder::name)
    /// - [`is_indoor`](CatBuilder::is_indoor)
    /// - [`lives_remaining`](CatBuilder::lives_remaining)
    pub fn build(self) -> Result<Cat, BuildError> {
        Ok(Cat {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            is_indoor: self.is_indoor.ok_or_else(|| BuildError::missing_field("is_indoor"))?,
            lives_remaining: self.lives_remaining.ok_or_else(|| BuildError::missing_field("lives_remaining"))?,
        })
    }
}
