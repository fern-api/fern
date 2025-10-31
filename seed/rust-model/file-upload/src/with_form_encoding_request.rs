pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WithFormEncodingRequest {
    pub file: String,
    pub foo: String,
    pub bar: MyObject,
}
