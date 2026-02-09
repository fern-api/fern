pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StackInformation {
    #[serde(rename = "numStackFrames")]
    pub num_stack_frames: i64,
    #[serde(rename = "topStackFrame")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_stack_frame: Option<StackFrame>,
}