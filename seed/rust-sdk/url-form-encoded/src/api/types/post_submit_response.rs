pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PostSubmitResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl PostSubmitResponse {
    pub fn builder() -> PostSubmitResponseBuilder {
        <PostSubmitResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PostSubmitResponseBuilder {
    status: Option<String>,
    message: Option<String>,
}

impl PostSubmitResponseBuilder {
    pub fn status(mut self, value: impl Into<String>) -> Self {
        self.status = Some(value.into());
        self
    }

    pub fn message(mut self, value: impl Into<String>) -> Self {
        self.message = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`PostSubmitResponse`].
    pub fn build(self) -> Result<PostSubmitResponse, BuildError> {
        Ok(PostSubmitResponse {
            status: self.status,
            message: self.message,
        })
    }
}
