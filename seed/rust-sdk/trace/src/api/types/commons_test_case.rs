pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCase {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub params: Vec<VariableValue>,
}
