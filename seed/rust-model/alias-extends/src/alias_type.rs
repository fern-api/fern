use serde::{Deserialize, Serialize};
use crate::parent::Parent;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AliasType(pub Parent);