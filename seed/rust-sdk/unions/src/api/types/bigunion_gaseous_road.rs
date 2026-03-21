pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GaseousRoad {
    #[serde(default)]
    pub value: String,
}
