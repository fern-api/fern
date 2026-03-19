pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata {
    #[serde(default)]
    pub id: TestCaseId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub hidden: bool,
}
