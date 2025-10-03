pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum InvalidRequestCause {
    SubmissionIdNotFound {
        #[serde(flatten)]
        data: SubmissionIdNotFound,
    },

    CustomTestCasesUnsupported {
        #[serde(flatten)]
        data: CustomTestCasesUnsupported,
    },

    UnexpectedLanguage {
        #[serde(flatten)]
        data: UnexpectedLanguageError,
    },
}
