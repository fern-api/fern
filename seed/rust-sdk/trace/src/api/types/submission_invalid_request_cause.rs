pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum InvalidRequestCause {
        #[serde(rename = "submissionIdNotFound")]
        SubmissionIdNotFound {
            #[serde(flatten)]
            data: SubmissionIdNotFound,
        },

        #[serde(rename = "customTestCasesUnsupported")]
        CustomTestCasesUnsupported {
            #[serde(flatten)]
            data: CustomTestCasesUnsupported,
        },

        #[serde(rename = "unexpectedLanguage")]
        UnexpectedLanguage {
            #[serde(flatten)]
            data: UnexpectedLanguageError,
        },
}
