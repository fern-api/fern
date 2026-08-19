pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum ActualResult {
    #[serde(rename = "value")]
    #[non_exhaustive]
    Value { value: VariableValue },

    #[serde(rename = "exception")]
    #[non_exhaustive]
    Exception {
        #[serde(flatten)]
        data: ExceptionInfo,
    },

    #[serde(rename = "exceptionV2")]
    #[non_exhaustive]
    ExceptionV2 { value: ExceptionV2 },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl ActualResult {
    pub fn value(value: VariableValue) -> Self {
        Self::Value { value }
    }

    pub fn exception(data: ExceptionInfo) -> Self {
        Self::Exception { data }
    }

    pub fn exception_v2(value: ExceptionV2) -> Self {
        Self::ExceptionV2 { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
