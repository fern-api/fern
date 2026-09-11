pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct KnowledgeBase {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl KnowledgeBase {
    pub fn builder() -> KnowledgeBaseBuilder {
        <KnowledgeBaseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct KnowledgeBaseBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl KnowledgeBaseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`KnowledgeBase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](KnowledgeBaseBuilder::id)
    pub fn build(self) -> Result<KnowledgeBase, BuildError> {
        Ok(KnowledgeBase {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name,
        })
    }
}
