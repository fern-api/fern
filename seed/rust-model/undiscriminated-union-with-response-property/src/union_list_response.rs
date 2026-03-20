pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionListResponse {
    #[serde(default)]
    pub data: Vec<MyUnion>,
}