pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Record {
    pub foo: HashMap<String, String>,
    #[serde(rename = "3d")]
    pub _3_d: i64,
}
