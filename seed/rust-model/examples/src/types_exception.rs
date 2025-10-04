pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Exception {
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        Timeout,
}
