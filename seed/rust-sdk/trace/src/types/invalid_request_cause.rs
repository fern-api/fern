use crate::submission_id_not_found::SubmissionIdNotFound;
use crate::custom_test_cases_unsupported::CustomTestCasesUnsupported;
use crate::unexpected_language_error::UnexpectedLanguageError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
