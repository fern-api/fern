pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesAnimalZero {
    #[serde(flatten)]
    pub types_dog_fields: TypesDog,
    pub animal: TypesAnimalZeroAnimal,
}

impl TypesAnimalZero {
    pub fn builder() -> TypesAnimalZeroBuilder {
        <TypesAnimalZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesAnimalZeroBuilder {
    types_dog_fields: Option<TypesDog>,
    animal: Option<TypesAnimalZeroAnimal>,
}

impl TypesAnimalZeroBuilder {
    pub fn types_dog_fields(mut self, value: TypesDog) -> Self {
        self.types_dog_fields = Some(value);
        self
    }

    pub fn animal(mut self, value: TypesAnimalZeroAnimal) -> Self {
        self.animal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesAnimalZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`types_dog_fields`](TypesAnimalZeroBuilder::types_dog_fields)
    /// - [`animal`](TypesAnimalZeroBuilder::animal)
    pub fn build(self) -> Result<TypesAnimalZero, BuildError> {
        Ok(TypesAnimalZero {
            types_dog_fields: self.types_dog_fields.ok_or_else(|| BuildError::missing_field("types_dog_fields"))?,
            animal: self.animal.ok_or_else(|| BuildError::missing_field("animal"))?,
        })
    }
}
