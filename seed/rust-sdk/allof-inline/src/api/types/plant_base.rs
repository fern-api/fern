pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlantBase {
    /// The botanical species name.
    #[serde(default)]
    pub species: String,
    /// The botanical family.
    #[serde(default)]
    pub family: String,
    /// The botanical genus.
    #[serde(default)]
    pub genus: String,
    /// The common name of the plant.
    #[serde(rename = "commonName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub common_name: Option<String>,
    #[serde(rename = "wateringFrequency")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub watering_frequency: Option<PlantBaseWateringFrequency>,
}

impl PlantBase {
    pub fn builder() -> PlantBaseBuilder {
        <PlantBaseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlantBaseBuilder {
    species: Option<String>,
    family: Option<String>,
    genus: Option<String>,
    common_name: Option<String>,
    watering_frequency: Option<PlantBaseWateringFrequency>,
}

impl PlantBaseBuilder {
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

    pub fn common_name(mut self, value: impl Into<String>) -> Self {
        self.common_name = Some(value.into());
        self
    }

    pub fn watering_frequency(mut self, value: PlantBaseWateringFrequency) -> Self {
        self.watering_frequency = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PlantBase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`species`](PlantBaseBuilder::species)
    /// - [`family`](PlantBaseBuilder::family)
    /// - [`genus`](PlantBaseBuilder::genus)
    pub fn build(self) -> Result<PlantBase, BuildError> {
        Ok(PlantBase {
            species: self
                .species
                .ok_or_else(|| BuildError::missing_field("species"))?,
            family: self
                .family
                .ok_or_else(|| BuildError::missing_field("family"))?,
            genus: self
                .genus
                .ok_or_else(|| BuildError::missing_field("genus"))?,
            common_name: self.common_name,
            watering_frequency: self.watering_frequency,
        })
    }
}
