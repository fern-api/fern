pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct InvalidRequestResponse {
    pub request: SubmissionRequest,
    pub cause: InvalidRequestCause,
}

impl InvalidRequestResponse {
    pub fn builder() -> InvalidRequestResponseBuilder {
        InvalidRequestResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InvalidRequestResponseBuilder {
    request: Option<SubmissionRequest>,
    cause: Option<InvalidRequestCause>,
}

impl InvalidRequestResponseBuilder {
    pub fn request(mut self, value: SubmissionRequest) -> Self {
        self.request = Some(value);
        self
    }

    pub fn cause(mut self, value: InvalidRequestCause) -> Self {
        self.cause = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InvalidRequestResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request`](InvalidRequestResponseBuilder::request)
    /// - [`cause`](InvalidRequestResponseBuilder::cause)
    pub fn build(self) -> Result<InvalidRequestResponse, BuildError> {
        Ok(InvalidRequestResponse {
            request: self.request.ok_or_else(|| BuildError::missing_field("request"))?,
            cause: self.cause.ok_or_else(|| BuildError::missing_field("cause"))?,
        })
    }
}
