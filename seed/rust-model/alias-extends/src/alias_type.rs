use serde::{Deserialize, Serialize};
use crate::parent::Parent;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct AliasType(pub Parent);