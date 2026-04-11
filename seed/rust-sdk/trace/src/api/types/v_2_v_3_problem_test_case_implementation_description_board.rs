pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TestCaseImplementationDescriptionBoard2 {
    #[serde(rename = "html")]
    #[non_exhaustive]
    Html { value: String },

    #[serde(rename = "paramId")]
    #[non_exhaustive]
    ParamId { value: ParameterId2 },
}

impl TestCaseImplementationDescriptionBoard2 {
    pub fn html(value: String) -> Self {
        Self::Html { value }
    }

    pub fn param_id(value: ParameterId2) -> Self {
        Self::ParamId { value }
    }
}
