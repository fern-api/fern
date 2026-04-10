pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Node {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<Metadata>,
}

impl Node {
    pub fn builder() -> NodeBuilder {
        <NodeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NodeBuilder {
    id: Option<String>,
    label: Option<String>,
    metadata: Option<Metadata>,
}

impl NodeBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn label(mut self, value: impl Into<String>) -> Self {
        self.label = Some(value.into());
        self
    }

    pub fn metadata(mut self, value: Metadata) -> Self {
        self.metadata = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Node`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](NodeBuilder::id)
    pub fn build(self) -> Result<Node, BuildError> {
        Ok(Node {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            label: self.label,
            metadata: self.metadata,
        })
    }
}
