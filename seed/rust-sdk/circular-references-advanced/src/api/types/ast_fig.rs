pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(transparent)]
pub struct Fig {
    pub animal: Box<Animal>,
}

impl Fig {
    pub fn builder() -> FigBuilder {
        FigBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FigBuilder {
    animal: Option<Box<Animal>>,
}

impl FigBuilder {
    pub fn animal(mut self, value: Box<Animal>) -> Self {
        self.animal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Fig`].
    /// This method will fail if any of the following fields are not set:
    /// - [`animal`](FigBuilder::animal)
    pub fn build(self) -> Result<Fig, BuildError> {
        Ok(Fig {
            animal: self
                .animal
                .ok_or_else(|| BuildError::missing_field("animal"))?,
        })
    }
}
