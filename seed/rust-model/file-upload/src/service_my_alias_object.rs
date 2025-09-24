use serde::{Deserialize, Serialize};
use crate::service_my_object::MyObject;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct MyAliasObject(pub MyObject);