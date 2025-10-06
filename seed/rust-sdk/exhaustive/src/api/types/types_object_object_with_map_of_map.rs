pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesObjectObjectWithMapOfMap {
    pub map: HashMap<String, HashMap<String, String>>,
}
