pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRequestFour {
    #[serde(flatten)]
    pub stop_request_fields: StopRequest,
    pub r#type: SubmissionRequestFourType,
}

impl SubmissionRequestFour {
    pub fn builder() -> SubmissionRequestFourBuilder {
        <SubmissionRequestFourBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionRequestFourBuilder {
    stop_request_fields: Option<StopRequest>,
    r#type: Option<SubmissionRequestFourType>,
}

impl SubmissionRequestFourBuilder {
    pub fn stop_request_fields(mut self, value: StopRequest) -> Self {
        self.stop_request_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionRequestFourType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionRequestFour`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stop_request_fields`](SubmissionRequestFourBuilder::stop_request_fields)
    /// - [`r#type`](SubmissionRequestFourBuilder::r#type)
    pub fn build(self) -> Result<SubmissionRequestFour, BuildError> {
        Ok(SubmissionRequestFour {
            stop_request_fields: self
                .stop_request_fields
                .ok_or_else(|| BuildError::missing_field("stop_request_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
