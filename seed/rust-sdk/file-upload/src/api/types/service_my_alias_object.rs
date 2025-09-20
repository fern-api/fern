use crate::service_my_object::MyObject;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MyAliasObject(pub MyObject);
