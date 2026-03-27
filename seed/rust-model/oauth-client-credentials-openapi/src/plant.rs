pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Plant {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub species: Option<String>,
}

impl Plant {
    pub fn builder() -> PlantBuilder {
        <PlantBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlantBuilder {
    id: Option<String>,
    name: Option<String>,
    species: Option<String>,
}

impl PlantBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn species(mut self, value: impl Into<String>) -> Self {
        self.species = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Plant`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](PlantBuilder::id)
    /// - [`name`](PlantBuilder::name)
    pub fn build(self) -> Result<Plant, BuildError> {
        Ok(Plant {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            species: self.species,
        })
    }
}
