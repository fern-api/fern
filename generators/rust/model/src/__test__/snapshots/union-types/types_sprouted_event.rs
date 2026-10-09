pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SproutedEvent {
    #[serde(flatten)]
    pub plant_event_base_fields: PlantEventBase,
}

impl SproutedEvent {
    pub fn builder() -> SproutedEventBuilder {
        <SproutedEventBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SproutedEventBuilder {
    plant_event_base_fields: Option<PlantEventBase>,
}

impl SproutedEventBuilder {
    pub fn plant_event_base_fields(mut self, value: PlantEventBase) -> Self {
        self.plant_event_base_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SproutedEvent`].
    /// This method will fail if any of the following fields are not set:
    /// - [`plant_event_base_fields`](SproutedEventBuilder::plant_event_base_fields)
    pub fn build(self) -> Result<SproutedEvent, BuildError> {
        Ok(SproutedEvent {
            plant_event_base_fields: self.plant_event_base_fields.ok_or_else(|| BuildError::missing_field("plant_event_base_fields"))?,
        })
    }
}
