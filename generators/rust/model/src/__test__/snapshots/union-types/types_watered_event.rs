pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WateredEvent {
    #[serde(flatten)]
    pub plant_event_base_fields: PlantEventBase,
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers")]
    pub liters: f64,
}

impl WateredEvent {
    pub fn builder() -> WateredEventBuilder {
        <WateredEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WateredEventBuilder {
    plant_event_base_fields: Option<PlantEventBase>,
    liters: Option<f64>,
}

impl WateredEventBuilder {
    pub fn plant_event_base_fields(mut self, value: PlantEventBase) -> Self {
        self.plant_event_base_fields = Some(value);
        self
    }

    pub fn liters(mut self, value: f64) -> Self {
        self.liters = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WateredEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`plant_event_base_fields`](WateredEventBuilder::plant_event_base_fields)
    /// - [`liters`](WateredEventBuilder::liters)
    pub fn build(self) -> Result<WateredEvent, BuildError> {
        Ok(WateredEvent {
            plant_event_base_fields: self.plant_event_base_fields.ok_or_else(|| BuildError::missing_field("plant_event_base_fields"))?,
            liters: self.liters.ok_or_else(|| BuildError::missing_field("liters"))?,
        })
    }
}
