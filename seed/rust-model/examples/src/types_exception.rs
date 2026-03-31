pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Exception {
        #[serde(rename = "generic")]
        #[non_exhaustive]
        Generic {
            #[serde(rename = "exceptionType")]
            #[serde(default)]
            exception_type: String,
            #[serde(rename = "exceptionMessage")]
            #[serde(default)]
            exception_message: String,
            #[serde(rename = "exceptionStacktrace")]
            #[serde(default)]
            exception_stacktrace: String,
        },

        #[serde(rename = "timeout")]
        #[non_exhaustive]
        Timeout {},
}

impl Exception {
    pub fn generic(exception_type: String, exception_message: String, exception_stacktrace: String) -> Self {
        Self::Generic { exception_type, exception_message, exception_stacktrace }
    }

    pub fn timeout() -> Self {
        Self::Timeout {}
    }
}
