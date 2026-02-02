pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Exception {
        #[serde(rename = "generic")]
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        #[serde(rename = "timeout")]
        Timeout,
}
