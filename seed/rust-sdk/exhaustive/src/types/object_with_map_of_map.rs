use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithMapOfMap {
    pub map: HashMap<String, HashMap<String, String>>,
}