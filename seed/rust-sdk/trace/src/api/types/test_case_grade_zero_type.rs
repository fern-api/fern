pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TestCaseGradeZeroType {
    #[serde(rename = "hidden")]
    Hidden,
}
impl fmt::Display for TestCaseGradeZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Hidden => "hidden",
        };
        write!(f, "{}", s)
    }
}
