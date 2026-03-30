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

impl LightweightStackframeInformation {
    pub fn builder() -> LightweightStackframeInformationBuilder {
        <LightweightStackframeInformationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LightweightStackframeInformationBuilder {
    num_stack_frames: Option<i64>,
    top_stack_frame_method_name: Option<String>,
}

impl LightweightStackframeInformationBuilder {
    pub fn num_stack_frames(mut self, value: i64) -> Self {
        self.num_stack_frames = Some(value);
        self
    }

    pub fn top_stack_frame_method_name(mut self, value: impl Into<String>) -> Self {
        self.top_stack_frame_method_name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`LightweightStackframeInformation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`num_stack_frames`](LightweightStackframeInformationBuilder::num_stack_frames)
    /// - [`top_stack_frame_method_name`](LightweightStackframeInformationBuilder::top_stack_frame_method_name)
    pub fn build(self) -> Result<LightweightStackframeInformation, BuildError> {
        Ok(LightweightStackframeInformation {
            num_stack_frames: self
                .num_stack_frames
                .ok_or_else(|| BuildError::missing_field("num_stack_frames"))?,
            top_stack_frame_method_name: self
                .top_stack_frame_method_name
                .ok_or_else(|| BuildError::missing_field("top_stack_frame_method_name"))?,
        })
    }
}
