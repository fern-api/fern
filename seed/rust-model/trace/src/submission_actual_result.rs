pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionActualResult {
        Value {
            value: CommonsVariableValue,
        },

        Exception {
            #[serde(flatten)]
            data: SubmissionExceptionInfo,
        },

        ExceptionV2 {
            value: SubmissionExceptionV2,
        },
}
