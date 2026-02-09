pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TestCaseImplementationDescriptionBoard {
        #[serde(rename = "html")]
        Html {
            value: String,
        },

        #[serde(rename = "paramId")]
        ParamId {
            value: ParameterId,
        },
}
