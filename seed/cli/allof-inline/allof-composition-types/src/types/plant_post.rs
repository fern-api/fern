pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PlantPost {
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
    #[serde(default)]
    pub common_name: String,
    #[serde(rename = "wateringFrequency")]
    pub watering_frequency: PlantPostWateringFrequency,
    /// Required sun exposure level.
    #[serde(rename = "sunExposure")]
    pub sun_exposure: PlantPostSunExposure,
    /// Date the plant was planted.
    #[serde(rename = "plantedAt")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub planted_at: Option<NaiveDate>,
    /// Preferred soil type.
    #[serde(rename = "soilType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soil_type: Option<String>,
}

impl PlantPost {
    pub fn builder() -> PlantPostBuilder {
        <PlantPostBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlantPostBuilder {
    species: Option<String>,
    family: Option<String>,
    genus: Option<String>,
    common_name: Option<String>,
    watering_frequency: Option<PlantPostWateringFrequency>,
    sun_exposure: Option<PlantPostSunExposure>,
    planted_at: Option<NaiveDate>,
    soil_type: Option<String>,
}

impl PlantPostBuilder {
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

    pub fn watering_frequency(mut self, value: PlantPostWateringFrequency) -> Self {
        self.watering_frequency = Some(value);
        self
    }

    pub fn sun_exposure(mut self, value: PlantPostSunExposure) -> Self {
        self.sun_exposure = Some(value);
        self
    }

    pub fn planted_at(mut self, value: NaiveDate) -> Self {
        self.planted_at = Some(value);
        self
    }

    pub fn soil_type(mut self, value: impl Into<String>) -> Self {
        self.soil_type = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PlantPost`].
    /// This method will fail if any of the following fields are not set:
    /// - [`species`](PlantPostBuilder::species)
    /// - [`family`](PlantPostBuilder::family)
    /// - [`genus`](PlantPostBuilder::genus)
    /// - [`common_name`](PlantPostBuilder::common_name)
    /// - [`watering_frequency`](PlantPostBuilder::watering_frequency)
    /// - [`sun_exposure`](PlantPostBuilder::sun_exposure)
    pub fn build(self) -> Result<PlantPost, BuildError> {
        Ok(PlantPost {
            species: self.species.ok_or_else(|| BuildError::missing_field("species"))?,
            family: self.family.ok_or_else(|| BuildError::missing_field("family"))?,
            genus: self.genus.ok_or_else(|| BuildError::missing_field("genus"))?,
            common_name: self.common_name.ok_or_else(|| BuildError::missing_field("common_name"))?,
            watering_frequency: self.watering_frequency.ok_or_else(|| BuildError::missing_field("watering_frequency"))?,
            sun_exposure: self.sun_exposure.ok_or_else(|| BuildError::missing_field("sun_exposure"))?,
            planted_at: self.planted_at,
            soil_type: self.soil_type,
        })
    }
}

