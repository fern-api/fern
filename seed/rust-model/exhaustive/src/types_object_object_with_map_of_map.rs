pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ObjectWithMapOfMap {
    pub map: HashMap<String, HashMap<String, String>>,
}