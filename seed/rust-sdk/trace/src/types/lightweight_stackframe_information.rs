use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LightweightStackframeInformation {
    #[serde(rename = "numStackFrames")]
    pub num_stack_frames: i32,
    #[serde(rename = "topStackFrameMethodName")]
    pub top_stack_frame_method_name: String,
}