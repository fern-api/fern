pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Generateequest {
    pub stream: bool,
    #[serde(default)]
    pub num_events: i64,
}
