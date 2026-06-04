pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum InvalidRequestCause {
    #[serde(rename = "submissionIdNotFound")]
    #[non_exhaustive]
    SubmissionIdNotFound {
        #[serde(rename = "missingSubmissionId")]
        #[serde(default)]
        missing_submission_id: SubmissionId,
    },

    #[serde(rename = "customTestCasesUnsupported")]
    #[non_exhaustive]
    CustomTestCasesUnsupported {
        #[serde(rename = "problemId")]
        #[serde(default)]
        problem_id: ProblemId,
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
    },

    #[serde(rename = "unexpectedLanguage")]
    #[non_exhaustive]
    UnexpectedLanguage {
        #[serde(rename = "expectedLanguage")]
        expected_language: Language,
        #[serde(rename = "actualLanguage")]
        actual_language: Language,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl InvalidRequestCause {
    pub fn submission_id_not_found(missing_submission_id: SubmissionId) -> Self {
        Self::SubmissionIdNotFound {
            missing_submission_id,
        }
    }

    pub fn custom_test_cases_unsupported(
        problem_id: ProblemId,
        submission_id: SubmissionId,
    ) -> Self {
        Self::CustomTestCasesUnsupported {
            problem_id,
            submission_id,
        }
    }

    pub fn unexpected_language(expected_language: Language, actual_language: Language) -> Self {
        Self::UnexpectedLanguage {
            expected_language,
            actual_language,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
