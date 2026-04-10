pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum TestSubmissionUpdateInfo {
    TestSubmissionUpdateInfoZero(TestSubmissionUpdateInfoZero),

    TestSubmissionUpdateInfoOne(TestSubmissionUpdateInfoOne),

    TestSubmissionUpdateInfoTwo(TestSubmissionUpdateInfoTwo),

    TestSubmissionUpdateInfoThree(TestSubmissionUpdateInfoThree),

    TestSubmissionUpdateInfoFour(TestSubmissionUpdateInfoFour),

    TestSubmissionUpdateInfoFive(TestSubmissionUpdateInfoFive),
}

impl TestSubmissionUpdateInfo {
    pub fn is_test_submission_update_info_zero(&self) -> bool {
        matches!(self, Self::TestSubmissionUpdateInfoZero(_))
    }

    pub fn is_test_submission_update_info_one(&self) -> bool {
        matches!(self, Self::TestSubmissionUpdateInfoOne(_))
    }

    pub fn is_test_submission_update_info_two(&self) -> bool {
        matches!(self, Self::TestSubmissionUpdateInfoTwo(_))
    }

    pub fn is_test_submission_update_info_three(&self) -> bool {
        matches!(self, Self::TestSubmissionUpdateInfoThree(_))
    }

    pub fn is_test_submission_update_info_four(&self) -> bool {
        matches!(self, Self::TestSubmissionUpdateInfoFour(_))
    }

    pub fn is_test_submission_update_info_five(&self) -> bool {
        matches!(self, Self::TestSubmissionUpdateInfoFive(_))
    }

    pub fn as_test_submission_update_info_zero(&self) -> Option<&TestSubmissionUpdateInfoZero> {
        match self {
            Self::TestSubmissionUpdateInfoZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_submission_update_info_zero(self) -> Option<TestSubmissionUpdateInfoZero> {
        match self {
            Self::TestSubmissionUpdateInfoZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_test_submission_update_info_one(&self) -> Option<&TestSubmissionUpdateInfoOne> {
        match self {
            Self::TestSubmissionUpdateInfoOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_submission_update_info_one(self) -> Option<TestSubmissionUpdateInfoOne> {
        match self {
            Self::TestSubmissionUpdateInfoOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_test_submission_update_info_two(&self) -> Option<&TestSubmissionUpdateInfoTwo> {
        match self {
            Self::TestSubmissionUpdateInfoTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_submission_update_info_two(self) -> Option<TestSubmissionUpdateInfoTwo> {
        match self {
            Self::TestSubmissionUpdateInfoTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_test_submission_update_info_three(&self) -> Option<&TestSubmissionUpdateInfoThree> {
        match self {
            Self::TestSubmissionUpdateInfoThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_submission_update_info_three(self) -> Option<TestSubmissionUpdateInfoThree> {
        match self {
            Self::TestSubmissionUpdateInfoThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_test_submission_update_info_four(&self) -> Option<&TestSubmissionUpdateInfoFour> {
        match self {
            Self::TestSubmissionUpdateInfoFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_submission_update_info_four(self) -> Option<TestSubmissionUpdateInfoFour> {
        match self {
            Self::TestSubmissionUpdateInfoFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_test_submission_update_info_five(&self) -> Option<&TestSubmissionUpdateInfoFive> {
        match self {
            Self::TestSubmissionUpdateInfoFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_submission_update_info_five(self) -> Option<TestSubmissionUpdateInfoFive> {
        match self {
            Self::TestSubmissionUpdateInfoFive(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for TestSubmissionUpdateInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::TestSubmissionUpdateInfoZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::TestSubmissionUpdateInfoOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::TestSubmissionUpdateInfoTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::TestSubmissionUpdateInfoThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::TestSubmissionUpdateInfoFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::TestSubmissionUpdateInfoFive(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
