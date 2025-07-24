use serde::{Deserialize, Serialize};
use crate::types::parent::Parent;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Child {
    #[serde(flatten)]
    pub parent_fields: Parent,
    pub child: String,
}