use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Bird {
    pub name: String,
    pub can_fly: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wing_span: Option<f64>,
}