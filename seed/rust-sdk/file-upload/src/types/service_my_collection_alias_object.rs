use serde::{Deserialize, Serialize};
use crate::service_my_object::MyObject;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MyCollectionAliasObject(pub Vec<MyObject>);