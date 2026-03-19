pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Record {
    #[serde(default)]
    pub foo: HashMap<String, String>,
    #[serde(rename = "3d")]
    #[serde(default)]
    pub _3_d: i64,
}