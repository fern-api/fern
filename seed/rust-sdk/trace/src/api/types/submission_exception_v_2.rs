pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum ExceptionV2 {
        #[serde(rename = "generic")]
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        #[serde(rename = "timeout")]
        Timeout,
}
