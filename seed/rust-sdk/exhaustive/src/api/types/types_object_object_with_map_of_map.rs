pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ObjectWithMapOfMap {
    #[serde(default)]
    pub map: HashMap<String, HashMap<String, String>>,
}