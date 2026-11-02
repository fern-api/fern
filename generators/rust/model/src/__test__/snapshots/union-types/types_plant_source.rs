pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "source")]
#[non_exhaustive]
pub enum PlantSource {
        #[serde(rename = "seed")]
        #[non_exhaustive]
        Seed {
            #[serde(default)]
            supplier: String,
        },

        #[serde(rename = "cutting")]
        #[non_exhaustive]
        Cutting {
            #[serde(default)]
            parent_plant: String,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl PlantSource {
    pub fn seed(supplier: String) -> Self {
        Self::Seed { supplier }
    }

    pub fn cutting(parent_plant: String) -> Self {
        Self::Cutting { parent_plant }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
