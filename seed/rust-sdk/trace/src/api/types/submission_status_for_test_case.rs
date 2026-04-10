pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SubmissionStatusForTestCase {
    SubmissionStatusForTestCaseZero(SubmissionStatusForTestCaseZero),

    SubmissionStatusForTestCaseType(SubmissionStatusForTestCaseType),

    SubmissionStatusForTestCaseTwo(SubmissionStatusForTestCaseTwo),
}

impl SubmissionStatusForTestCase {
    pub fn is_submission_status_for_test_case_zero(&self) -> bool {
        matches!(self, Self::SubmissionStatusForTestCaseZero(_))
    }

    pub fn is_submission_status_for_test_case_type(&self) -> bool {
        matches!(self, Self::SubmissionStatusForTestCaseType(_))
    }

    pub fn is_submission_status_for_test_case_two(&self) -> bool {
        matches!(self, Self::SubmissionStatusForTestCaseTwo(_))
    }

    pub fn as_submission_status_for_test_case_zero(
        &self,
    ) -> Option<&SubmissionStatusForTestCaseZero> {
        match self {
            Self::SubmissionStatusForTestCaseZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_status_for_test_case_zero(
        self,
    ) -> Option<SubmissionStatusForTestCaseZero> {
        match self {
            Self::SubmissionStatusForTestCaseZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_submission_status_for_test_case_type(
        &self,
    ) -> Option<&SubmissionStatusForTestCaseType> {
        match self {
            Self::SubmissionStatusForTestCaseType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_status_for_test_case_type(
        self,
    ) -> Option<SubmissionStatusForTestCaseType> {
        match self {
            Self::SubmissionStatusForTestCaseType(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_submission_status_for_test_case_two(
        &self,
    ) -> Option<&SubmissionStatusForTestCaseTwo> {
        match self {
            Self::SubmissionStatusForTestCaseTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_status_for_test_case_two(
        self,
    ) -> Option<SubmissionStatusForTestCaseTwo> {
        match self {
            Self::SubmissionStatusForTestCaseTwo(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for SubmissionStatusForTestCase {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SubmissionStatusForTestCaseZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::SubmissionStatusForTestCaseType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::SubmissionStatusForTestCaseTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
