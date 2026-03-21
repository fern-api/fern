pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ActualResult {
        #[serde(rename = "value")]
        #[non_exhaustive]
        Value {
            value: VariableValue,
        },

        #[serde(rename = "exception")]
        #[non_exhaustive]
        Exception {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        #[serde(rename = "exceptionV2")]
        #[non_exhaustive]
        ExceptionV2 {
            value: ExceptionV2,
        },
}

impl ActualResult {
    pub fn value(value: VariableValue) -> Self {
        Self::Value { value }
    }

    pub fn exception(data: ExceptionInfo) -> Self {
        Self::Exception { data }
    }

    pub fn exception_v_2(value: ExceptionV2) -> Self {
        Self::ExceptionV2 { value }
    }
}
