pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TestCaseImplementationDescriptionBoard {
        #[serde(rename = "html")]
        #[non_exhaustive]
        Html {
            value: String,
        },

        #[serde(rename = "paramId")]
        #[non_exhaustive]
        ParamId {
            value: ParameterId,
        },
}

impl TestCaseImplementationDescriptionBoard {
    pub fn html(value: String) -> Self {
        Self::Html { value }
    }

    pub fn param_id(value: ParameterId) -> Self {
        Self::ParamId { value }
    }
}
