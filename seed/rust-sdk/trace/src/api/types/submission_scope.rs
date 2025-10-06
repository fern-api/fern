pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionScope {
    pub variables: HashMap<String, CommonsDebugVariableValue>,
}
