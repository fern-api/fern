use crate::exception_info::ExceptionInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ExceptionV2 {
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        Timeout,
}
