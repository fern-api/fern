use crate::service_my_object::MyObject;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct MyCollectionAliasObject(pub Vec<MyObject>);
