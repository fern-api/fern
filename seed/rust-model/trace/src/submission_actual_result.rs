use crate::commons_variable_value::VariableValue;
use crate::submission_exception_info::ExceptionInfo;
use crate::submission_exception_v_2::ExceptionV2;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ActualResult {
        Value {
            value: VariableValue,
        },

        Exception {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        ExceptionV2 {
            value: ExceptionV2,
        },
}
