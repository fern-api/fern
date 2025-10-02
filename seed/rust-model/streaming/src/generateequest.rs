pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Generateequest {
    pub stream: bool,
    pub num_events: i64,
}