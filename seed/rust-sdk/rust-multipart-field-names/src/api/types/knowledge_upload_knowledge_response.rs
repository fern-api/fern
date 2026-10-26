pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UploadKnowledgeResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
}

impl UploadKnowledgeResponse {
    pub fn builder() -> UploadKnowledgeResponseBuilder {
        <UploadKnowledgeResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UploadKnowledgeResponseBuilder {
    id: Option<String>,
}

impl UploadKnowledgeResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UploadKnowledgeResponse`].
    pub fn build(self) -> Result<UploadKnowledgeResponse, BuildError> {
        Ok(UploadKnowledgeResponse { id: self.id })
    }
}
