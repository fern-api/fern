pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Scope {
    #[serde(default)]
    pub variables: HashMap<String, DebugVariableValue>,
}