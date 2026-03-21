pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(transparent)]
pub struct Dog {
    pub fruit: Box<Fruit>,
}

impl Dog {
    pub fn builder() -> DogBuilder {
        DogBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DogBuilder {
    fruit: Option<Box<Fruit>>,
}

impl DogBuilder {
    pub fn fruit(mut self, value: Box<Fruit>) -> Self {
        self.fruit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Dog`].
    /// This method will fail if any of the following fields are not set:
    /// - [`fruit`](DogBuilder::fruit)
    pub fn build(self) -> Result<Dog, BuildError> {
        Ok(Dog {
            fruit: self.fruit.ok_or_else(|| BuildError::missing_field("fruit"))?,
        })
    }
}
