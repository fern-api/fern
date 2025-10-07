pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NextPage2 {
    pub page: i64,
    pub starting_after: String,
}