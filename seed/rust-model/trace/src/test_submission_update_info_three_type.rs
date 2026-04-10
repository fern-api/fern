pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TestSubmissionUpdateInfoThreeType {
    #[serde(rename = "gradedTestCase")]
    GradedTestCase,
}
impl fmt::Display for TestSubmissionUpdateInfoThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GradedTestCase => "gradedTestCase",
        };
        write!(f, "{}", s)
    }
}
