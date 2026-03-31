pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "_type")]
pub enum CreateProblemError {
    #[serde(rename = "generic")]
    #[non_exhaustive]
    Generic {
        #[serde(default)]
        message: String,
        #[serde(default)]
        r#type: String,
        #[serde(default)]
        stacktrace: String,
    },
}

impl CreateProblemError {
    pub fn generic(message: String, r#type: String, stacktrace: String) -> Self {
        Self::Generic {
            message,
            r#type,
            stacktrace,
        }
    }
}
