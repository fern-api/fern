pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Car {
    #[serde(default)]
    pub doors: i64,
    #[serde(default)]
    pub fuel_type: String,
}