pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(transparent)]
pub struct Cat {
    pub fruit: Box<Fruit>,
}

impl Cat {
    pub fn builder() -> CatBuilder {
        <CatBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CatBuilder {
    fruit: Option<Box<Fruit>>,
}

impl CatBuilder {
    pub fn fruit(mut self, value: Box<Fruit>) -> Self {
        self.fruit = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Cat`].
    /// This method will fail if any of the following fields are not set:
    /// - [`fruit`](CatBuilder::fruit)
    pub fn build(self) -> Result<Cat, BuildError> {
        Ok(Cat {
            fruit: self
                .fruit
                .ok_or_else(|| BuildError::missing_field("fruit"))?,
        })
    }
}
