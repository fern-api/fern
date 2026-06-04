pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlantBase {
    #[serde(flatten)]
    pub plant_strict_fields: PlantStrict,
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
    plant_strict_fields: Option<PlantStrict>,
    common_name: Option<String>,
    watering_frequency: Option<PlantBaseWateringFrequency>,
}

impl PlantBaseBuilder {
    pub fn plant_strict_fields(mut self, value: PlantStrict) -> Self {
        self.plant_strict_fields = Some(value);
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
    /// - [`plant_strict_fields`](PlantBaseBuilder::plant_strict_fields)
    pub fn build(self) -> Result<PlantBase, BuildError> {
        Ok(PlantBase {
            plant_strict_fields: self.plant_strict_fields.ok_or_else(|| BuildError::missing_field("plant_strict_fields"))?,
            common_name: self.common_name,
            watering_frequency: self.watering_frequency,
        })
    }
}
