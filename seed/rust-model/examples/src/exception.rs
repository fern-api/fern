use serde::{Deserialize, Serialize};
use crate::exception_info::ExceptionInfo;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Exception {
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        Timeout,
}
