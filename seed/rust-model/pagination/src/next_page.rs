use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NextPage {
    pub page: i32,
    pub starting_after: String,
}