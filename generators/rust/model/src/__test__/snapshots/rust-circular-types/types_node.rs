pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Node {
    #[serde(default)]
    pub children: Vec<Box<Node>>,
}

impl Node {
    pub fn builder() -> NodeBuilder {
        <NodeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NodeBuilder {
    children: Option<Vec<Box<Node>>>,
}

impl NodeBuilder {
    pub fn children(mut self, value: Vec<Box<Node>>) -> Self {
        self.children = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Node`].
    /// This method will fail if any of the following fields are not set:
    /// - [`children`](NodeBuilder::children)
    pub fn build(self) -> Result<Node, BuildError> {
        Ok(Node {
            children: self.children.ok_or_else(|| BuildError::missing_field("children"))?,
        })
    }
}
