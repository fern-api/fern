pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Bird {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub can_fly: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wing_span: Option<f64>,
}