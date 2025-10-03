use crate::submission_submission_id_not_found::SubmissionIdNotFound;
use crate::submission_custom_test_cases_unsupported::CustomTestCasesUnsupported;
use crate::submission_unexpected_language_error::UnexpectedLanguageError;
use serde::{Deserialize, Serialize};

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
