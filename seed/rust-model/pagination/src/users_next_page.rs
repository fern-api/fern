pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UsersNextPage {
    pub page: i64,
    pub starting_after: String,
}