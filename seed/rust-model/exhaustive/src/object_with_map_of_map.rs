use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithMapOfMap {
    pub map: HashMap<String, HashMap<String, String>>,
}