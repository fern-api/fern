use crate::variable_value::VariableValue;
use crate::exception_info::ExceptionInfo;
use crate::exception_v_2::ExceptionV2;
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
