pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Berry {
    pub animal: Animal,
}

impl Berry {
    pub fn builder() -> BerryBuilder {
        BerryBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BerryBuilder {
    animal: Option<Animal>,
}

impl BerryBuilder {
    pub fn animal(mut self, value: Animal) -> Self {
        self.animal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Berry`].
    /// This method will fail if any of the following fields are not set:
    /// - [`animal`](BerryBuilder::animal)
    pub fn build(self) -> Result<Berry, BuildError> {
        Ok(Berry {
            animal: self
                .animal
                .ok_or_else(|| BuildError::missing_field("animal"))?,
        })
    }
}
