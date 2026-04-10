pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TestCaseGradeOneType {
    #[serde(rename = "nonHidden")]
    NonHidden,
}
impl fmt::Display for TestCaseGradeOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::NonHidden => "nonHidden",
        };
        write!(f, "{}", s)
    }
}
