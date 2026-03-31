pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BinaryTreeValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root: Option<NodeId>,
    #[serde(default)]
    pub nodes: HashMap<NodeId, BinaryTreeNodeValue>,
}

impl BinaryTreeValue {
    pub fn builder() -> BinaryTreeValueBuilder {
        <BinaryTreeValueBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BinaryTreeValueBuilder {
    root: Option<NodeId>,
    nodes: Option<HashMap<NodeId, BinaryTreeNodeValue>>,
}

impl BinaryTreeValueBuilder {
    pub fn root(mut self, value: NodeId) -> Self {
        self.root = Some(value);
        self
    }

    pub fn nodes(mut self, value: HashMap<NodeId, BinaryTreeNodeValue>) -> Self {
        self.nodes = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BinaryTreeValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`nodes`](BinaryTreeValueBuilder::nodes)
    pub fn build(self) -> Result<BinaryTreeValue, BuildError> {
        Ok(BinaryTreeValue {
            root: self.root,
            nodes: self
                .nodes
                .ok_or_else(|| BuildError::missing_field("nodes"))?,
        })
    }
}
