pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Document {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}

impl Document {
    pub fn builder() -> DocumentBuilder {
        DocumentBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DocumentBuilder {
    id: Option<String>,
    title: Option<String>,
    content: Option<String>,
    author: Option<String>,
    tags: Option<Vec<String>>,
}

impl DocumentBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    pub fn content(mut self, value: impl Into<String>) -> Self {
        self.content = Some(value.into());
        self
    }

    pub fn author(mut self, value: impl Into<String>) -> Self {
        self.author = Some(value.into());
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Document`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](DocumentBuilder::id)
    /// - [`title`](DocumentBuilder::title)
    /// - [`content`](DocumentBuilder::content)
    pub fn build(self) -> Result<Document, BuildError> {
        Ok(Document {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            title: self
                .title
                .ok_or_else(|| BuildError::missing_field("title"))?,
            content: self
                .content
                .ok_or_else(|| BuildError::missing_field("content"))?,
            author: self.author,
            tags: self.tags,
        })
    }
}
