pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UpdateFooRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_text: Option<Option<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_number: Option<Option<f64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub non_nullable_text: Option<String>,
}
