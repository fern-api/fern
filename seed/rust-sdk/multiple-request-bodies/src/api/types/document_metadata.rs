pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DocumentMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
}

impl DocumentMetadata {
    pub fn builder() -> DocumentMetadataBuilder {
        <DocumentMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DocumentMetadataBuilder {
    author: Option<String>,
    id: Option<i64>,
    tags: Option<Vec<serde_json::Value>>,
    title: Option<String>,
}

impl DocumentMetadataBuilder {
    pub fn author(mut self, value: impl Into<String>) -> Self {
        self.author = Some(value.into());
        self
    }

    pub fn id(mut self, value: i64) -> Self {
        self.id = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<serde_json::Value>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DocumentMetadata`].
    pub fn build(self) -> Result<DocumentMetadata, BuildError> {
        Ok(DocumentMetadata {
            author: self.author,
            id: self.id,
            tags: self.tags,
            title: self.title,
        })
    }
}
