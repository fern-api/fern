pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct LightweightStackframeInformation {
    #[serde(rename = "numStackFrames")]
    #[serde(default)]
    pub num_stack_frames: i64,
    #[serde(rename = "topStackFrameMethodName")]
    #[serde(default)]
    pub top_stack_frame_method_name: String,
}
