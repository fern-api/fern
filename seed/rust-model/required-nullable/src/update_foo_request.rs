pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UpdateFooRequest {
    /// Can be explicitly set to null to clear the value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_text: Option<String>,
    /// Can be explicitly set to null to clear the value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_number: Option<f64>,
    /// Regular non-nullable field
    #[serde(skip_serializing_if = "Option::is_none")]
    pub non_nullable_text: Option<String>,
}
