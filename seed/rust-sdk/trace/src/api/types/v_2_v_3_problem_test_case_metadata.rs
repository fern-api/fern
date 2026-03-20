pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata2 {
    #[serde(default)]
    pub id: TestCaseId2,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub hidden: bool,
}