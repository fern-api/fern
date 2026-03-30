pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Dog {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub breed: String,
    #[serde(default)]
    pub age: i64,
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
    breed: Option<String>,
    age: Option<i64>,
}

impl DogBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn breed(mut self, value: impl Into<String>) -> Self {
        self.breed = Some(value.into());
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Dog`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](DogBuilder::name)
    /// - [`breed`](DogBuilder::breed)
    /// - [`age`](DogBuilder::age)
    pub fn build(self) -> Result<Dog, BuildError> {
        Ok(Dog {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            breed: self.breed.ok_or_else(|| BuildError::missing_field("breed"))?,
            age: self.age.ok_or_else(|| BuildError::missing_field("age"))?,
        })
    }
}
