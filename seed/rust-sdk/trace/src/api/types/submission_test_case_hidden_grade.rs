pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseHiddenGrade {
    #[serde(default)]
    pub passed: bool,
}
