use crate::submission_exception_info::ExceptionInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum ExceptionV2 {
        Generic {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        Timeout,
}
