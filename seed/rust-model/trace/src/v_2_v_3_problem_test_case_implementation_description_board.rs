pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TestCaseImplementationDescriptionBoard2 {
        Html {
            value: String,
        },

        ParamId {
            value: ParameterId2,
        },
}
