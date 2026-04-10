pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TestSubmissionUpdateInfoFourType {
    #[serde(rename = "recordedTestCase")]
    RecordedTestCase,
}
impl fmt::Display for TestSubmissionUpdateInfoFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::RecordedTestCase => "recordedTestCase",
        };
        write!(f, "{}", s)
    }
}
