pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsTestCase {
    pub id: String,
    pub params: Vec<CommonsVariableValue>,
}