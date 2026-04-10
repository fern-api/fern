pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRequestTwo {
    #[serde(flatten)]
    pub submit_request_v2_fields: SubmitRequestV2,
    pub r#type: SubmissionRequestTwoType,
}

impl SubmissionRequestTwo {
    pub fn builder() -> SubmissionRequestTwoBuilder {
        <SubmissionRequestTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SubmissionRequestTwoBuilder {
    submit_request_v2_fields: Option<SubmitRequestV2>,
    r#type: Option<SubmissionRequestTwoType>,
}

impl SubmissionRequestTwoBuilder {
    pub fn submit_request_v2_fields(mut self, value: SubmitRequestV2) -> Self {
        self.submit_request_v2_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: SubmissionRequestTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SubmissionRequestTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submit_request_v2_fields`](SubmissionRequestTwoBuilder::submit_request_v2_fields)
    /// - [`r#type`](SubmissionRequestTwoBuilder::r#type)
    pub fn build(self) -> Result<SubmissionRequestTwo, BuildError> {
        Ok(SubmissionRequestTwo {
            submit_request_v2_fields: self
                .submit_request_v2_fields
                .ok_or_else(|| BuildError::missing_field("submit_request_v2_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
