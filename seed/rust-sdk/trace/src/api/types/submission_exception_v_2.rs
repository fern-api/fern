pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SubmissionExceptionV2 {
    Generic {
        #[serde(flatten)]
        data: SubmissionExceptionInfo,
    },

    Timeout,
}
