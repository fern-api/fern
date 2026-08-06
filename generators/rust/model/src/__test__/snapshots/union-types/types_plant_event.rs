pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event")]
#[non_exhaustive]
pub enum PlantEvent {
        #[serde(rename = "sprouted")]
        #[non_exhaustive]
        Sprouted {
            #[serde(flatten)]
            data: SproutedEvent,
        },

        #[serde(rename = "watered")]
        #[non_exhaustive]
        Watered {
            #[serde(flatten)]
            data: WateredEvent,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl PlantEvent {
    pub fn sprouted(data: SproutedEvent) -> Self {
        Self::Sprouted { data }
    }

    pub fn watered(data: WateredEvent) -> Self {
        Self::Watered { data }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
