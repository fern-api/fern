pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesAnimalOne {
    #[serde(flatten)]
    pub types_cat_fields: TypesCat,
    pub animal: TypesAnimalOneAnimal,
}

impl TypesAnimalOne {
    pub fn builder() -> TypesAnimalOneBuilder {
        <TypesAnimalOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TypesAnimalOneBuilder {
    types_cat_fields: Option<TypesCat>,
    animal: Option<TypesAnimalOneAnimal>,
}

impl TypesAnimalOneBuilder {
    pub fn types_cat_fields(mut self, value: TypesCat) -> Self {
        self.types_cat_fields = Some(value);
        self
    }

    pub fn animal(mut self, value: TypesAnimalOneAnimal) -> Self {
        self.animal = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TypesAnimalOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`types_cat_fields`](TypesAnimalOneBuilder::types_cat_fields)
    /// - [`animal`](TypesAnimalOneBuilder::animal)
    pub fn build(self) -> Result<TypesAnimalOne, BuildError> {
        Ok(TypesAnimalOne {
            types_cat_fields: self
                .types_cat_fields
                .ok_or_else(|| BuildError::missing_field("types_cat_fields"))?,
            animal: self
                .animal
                .ok_or_else(|| BuildError::missing_field("animal"))?,
        })
    }
}
