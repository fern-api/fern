use serde::{Deserialize, Serialize};
use crate::types::root_type::RootType;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct A {
    #[serde(flatten)]
    pub root_type_fields: RootType,
}