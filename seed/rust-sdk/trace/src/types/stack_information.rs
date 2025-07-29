use crate::stack_frame::StackFrame;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StackInformation {
    #[serde(rename = "numStackFrames")]
    pub num_stack_frames: i32,
    #[serde(rename = "topStackFrame")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_stack_frame: Option<StackFrame>,
}