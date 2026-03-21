pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Node {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<Box<Node>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trees: Option<Vec<Box<Tree>>>,
}

impl Node {
    pub fn builder() -> NodeBuilder {
        NodeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NodeBuilder {
    name: Option<String>,
    nodes: Option<Vec<Box<Node>>>,
    trees: Option<Vec<Box<Tree>>>,
}

impl NodeBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn nodes(mut self, value: Vec<Box<Node>>) -> Self {
        self.nodes = Some(value);
        self
    }

    pub fn trees(mut self, value: Vec<Box<Tree>>) -> Self {
        self.trees = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Node`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](NodeBuilder::name)
    pub fn build(self) -> Result<Node, BuildError> {
        Ok(Node {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            nodes: self.nodes,
            trees: self.trees,
        })
    }
}
