pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlantStrict {
    /// The botanical species name.
    #[serde(default)]
    pub species: String,
    /// The botanical family.
    #[serde(default)]
    pub family: String,
    /// The botanical genus.
    #[serde(default)]
    pub genus: String,
}

impl PlantStrict {
    pub fn builder() -> PlantStrictBuilder {
        <PlantStrictBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlantStrictBuilder {
    species: Option<String>,
    family: Option<String>,
    genus: Option<String>,
}

impl PlantStrictBuilder {
    pub fn species(mut self, value: impl Into<String>) -> Self {
        self.species = Some(value.into());
        self
    }

    pub fn family(mut self, value: impl Into<String>) -> Self {
        self.family = Some(value.into());
        self
    }

    pub fn genus(mut self, value: impl Into<String>) -> Self {
        self.genus = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PlantStrict`].
    /// This method will fail if any of the following fields are not set:
    /// - [`species`](PlantStrictBuilder::species)
    /// - [`family`](PlantStrictBuilder::family)
    /// - [`genus`](PlantStrictBuilder::genus)
    pub fn build(self) -> Result<PlantStrict, BuildError> {
        Ok(PlantStrict {
            species: self.species.ok_or_else(|| BuildError::missing_field("species"))?,
            family: self.family.ok_or_else(|| BuildError::missing_field("family"))?,
            genus: self.genus.ok_or_else(|| BuildError::missing_field("genus"))?,
        })
    }
}
