use serde::{Deserialize, Serialize};
use crate::my_object::MyObject;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MyAliasObject(pub MyObject);