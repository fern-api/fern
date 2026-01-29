pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ActualResult {
        #[serde(rename = "value")]
        Value {
            value: VariableValue,
        },

        #[serde(rename = "exception")]
        Exception {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        #[serde(rename = "exceptionV2")]
        ExceptionV2 {
            value: ExceptionV2,
        },
}
