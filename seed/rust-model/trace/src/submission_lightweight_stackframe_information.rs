pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct LightweightStackframeInformation {
    #[serde(rename = "numStackFrames")]
    pub num_stack_frames: i64,
    #[serde(rename = "topStackFrameMethodName")]
    pub top_stack_frame_method_name: String,
}