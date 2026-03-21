pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum ExceptionV2 {
        #[serde(rename = "generic")]
        #[non_exhaustive]
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        #[serde(rename = "timeout")]
        #[non_exhaustive]
        Timeout {},
}

impl ExceptionV2 {
    pub fn generic(data: ExceptionInfo) -> Self {
        Self::Generic { data }
    }

    pub fn timeout() -> Self {
        Self::Timeout {}
    }
}
