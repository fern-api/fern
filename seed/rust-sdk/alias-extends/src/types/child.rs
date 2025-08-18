use crate::parent::Parent;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Child {
    #[serde(flatten)]
    pub parent_fields: Parent,
    pub child: String,
}