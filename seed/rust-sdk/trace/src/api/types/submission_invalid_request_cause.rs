pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SubmissionInvalidRequestCause {
    SubmissionIdNotFound {
        #[serde(flatten)]
        data: SubmissionSubmissionIdNotFound,
    },

    CustomTestCasesUnsupported {
        #[serde(flatten)]
        data: SubmissionCustomTestCasesUnsupported,
    },

    UnexpectedLanguage {
        #[serde(flatten)]
        data: SubmissionUnexpectedLanguageError,
    },
}
