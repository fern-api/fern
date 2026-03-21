pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BinaryTreeNodeAndTreeValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(rename = "fullTree")]
    #[serde(default)]
    pub full_tree: BinaryTreeValue,
}

impl BinaryTreeNodeAndTreeValue {
    pub fn builder() -> BinaryTreeNodeAndTreeValueBuilder {
        BinaryTreeNodeAndTreeValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BinaryTreeNodeAndTreeValueBuilder {
    node_id: Option<NodeId>,
    full_tree: Option<BinaryTreeValue>,
}

impl BinaryTreeNodeAndTreeValueBuilder {
    pub fn node_id(mut self, value: NodeId) -> Self {
        self.node_id = Some(value);
        self
    }

    pub fn full_tree(mut self, value: BinaryTreeValue) -> Self {
        self.full_tree = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BinaryTreeNodeAndTreeValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`node_id`](BinaryTreeNodeAndTreeValueBuilder::node_id)
    /// - [`full_tree`](BinaryTreeNodeAndTreeValueBuilder::full_tree)
    pub fn build(self) -> Result<BinaryTreeNodeAndTreeValue, BuildError> {
        Ok(BinaryTreeNodeAndTreeValue {
            node_id: self
                .node_id
                .ok_or_else(|| BuildError::missing_field("node_id"))?,
            full_tree: self
                .full_tree
                .ok_or_else(|| BuildError::missing_field("full_tree"))?,
        })
    }
}
