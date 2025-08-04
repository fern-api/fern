use crate::exception_v_2::ExceptionV2;
use crate::exception_info::ExceptionInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceRunDetails {
    #[serde(rename = "exceptionV2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception_v_2: Option<ExceptionV2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<ExceptionInfo>,
    pub stdout: String,
}