pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Dog {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "likesToWoof")]
    #[serde(default)]
    pub likes_to_woof: bool,
}

impl Dog {
    pub fn builder() -> DogBuilder {
        DogBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DogBuilder {
    name: Option<String>,
    likes_to_woof: Option<bool>,
}

impl DogBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn likes_to_woof(mut self, value: bool) -> Self {
        self.likes_to_woof = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Dog`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](DogBuilder::name)
    /// - [`likes_to_woof`](DogBuilder::likes_to_woof)
    pub fn build(self) -> Result<Dog, BuildError> {
        Ok(Dog {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            likes_to_woof: self
                .likes_to_woof
                .ok_or_else(|| BuildError::missing_field("likes_to_woof"))?,
        })
    }
}
