pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum TestCaseGrade {
    TestCaseGradeZero(TestCaseGradeZero),

    TestCaseGradeOne(TestCaseGradeOne),
}

impl TestCaseGrade {
    pub fn is_test_case_grade_zero(&self) -> bool {
        matches!(self, Self::TestCaseGradeZero(_))
    }

    pub fn is_test_case_grade_one(&self) -> bool {
        matches!(self, Self::TestCaseGradeOne(_))
    }

    pub fn as_test_case_grade_zero(&self) -> Option<&TestCaseGradeZero> {
        match self {
            Self::TestCaseGradeZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_case_grade_zero(self) -> Option<TestCaseGradeZero> {
        match self {
            Self::TestCaseGradeZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_test_case_grade_one(&self) -> Option<&TestCaseGradeOne> {
        match self {
            Self::TestCaseGradeOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_test_case_grade_one(self) -> Option<TestCaseGradeOne> {
        match self {
            Self::TestCaseGradeOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for TestCaseGrade {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::TestCaseGradeZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::TestCaseGradeOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
