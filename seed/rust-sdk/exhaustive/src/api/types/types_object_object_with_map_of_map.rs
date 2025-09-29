use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectWithMapOfMap {
    pub map: HashMap<String, HashMap<String, String>>,
}
