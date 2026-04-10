pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionResponseFive {
    #[serde(flatten)]
    pub terminated_response_fields: TerminatedResponse,
    pub r#type: SubmissionResponseFiveType,
}

impl SubmissionResponseFive {
    pub fn builder() -> SubmissionResponseFiveBuilder {
        <SubmissionResponseFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionResponseFiveBuilder {
    terminated_response_fields: Option<TerminatedResponse>,
    r#type: Option<SubmissionResponseFiveType>,
}

impl SubmissionResponseFiveBuilder {
    pub fn terminated_response_fields(mut self, value: TerminatedResponse) -> Self {
        self.terminated_response_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionResponseFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionResponseFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`terminated_response_fields`](SubmissionResponseFiveBuilder::terminated_response_fields)
    /// - [`r#type`](SubmissionResponseFiveBuilder::r#type)
    pub fn build(self) -> Result<SubmissionResponseFive, BuildError> {
        Ok(SubmissionResponseFive {
            terminated_response_fields: self.terminated_response_fields.ok_or_else(|| BuildError::missing_field("terminated_response_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
