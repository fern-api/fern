use crate::types_exception_info::ExceptionInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Exception {
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        Timeout,
}
