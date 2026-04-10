pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum V2V3TestCaseImplementationDescriptionBoard {
        #[serde(rename = "html")]
        #[non_exhaustive]
        Html {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },

        #[serde(rename = "paramId")]
        #[non_exhaustive]
        ParamId {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<V2V3ParameterId>,
        },
}

impl V2V3TestCaseImplementationDescriptionBoard {
    pub fn html() -> Self {
        Self::Html { value: None }
    }

    pub fn param_id() -> Self {
        Self::ParamId { value: None }
    }

    pub fn html_with_value(value: String) -> Self {
        Self::Html { value: Some(value) }
    }

    pub fn param_id_with_value(value: V2V3ParameterId) -> Self {
        Self::ParamId { value: Some(value) }
    }
}
