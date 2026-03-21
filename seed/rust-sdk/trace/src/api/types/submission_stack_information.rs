pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct StackInformation {
    #[serde(rename = "numStackFrames")]
    #[serde(default)]
    pub num_stack_frames: i64,
    #[serde(rename = "topStackFrame")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_stack_frame: Option<StackFrame>,
}

impl StackInformation {
    pub fn builder() -> StackInformationBuilder {
        StackInformationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StackInformationBuilder {
    num_stack_frames: Option<i64>,
    top_stack_frame: Option<StackFrame>,
}

impl StackInformationBuilder {
    pub fn num_stack_frames(mut self, value: i64) -> Self {
        self.num_stack_frames = Some(value);
        self
    }

    pub fn top_stack_frame(mut self, value: StackFrame) -> Self {
        self.top_stack_frame = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`StackInformation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`num_stack_frames`](StackInformationBuilder::num_stack_frames)
    pub fn build(self) -> Result<StackInformation, BuildError> {
        Ok(StackInformation {
            num_stack_frames: self.num_stack_frames.ok_or_else(|| BuildError::missing_field("num_stack_frames"))?,
            top_stack_frame: self.top_stack_frame,
        })
    }
}
