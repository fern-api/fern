pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionResponseFour {
    pub r#type: SubmissionResponseFourType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<CodeExecutionUpdate>,
}

impl SubmissionResponseFour {
    pub fn builder() -> SubmissionResponseFourBuilder {
        <SubmissionResponseFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionResponseFourBuilder {
    r#type: Option<SubmissionResponseFourType>,
    value: Option<CodeExecutionUpdate>,
}

impl SubmissionResponseFourBuilder {
    pub fn r#type(mut self, value: SubmissionResponseFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: CodeExecutionUpdate) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionResponseFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](SubmissionResponseFourBuilder::r#type)
    pub fn build(self) -> Result<SubmissionResponseFour, BuildError> {
        Ok(SubmissionResponseFour {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
