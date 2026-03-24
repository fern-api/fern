pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BinaryTreeNodeValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(default)]
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub right: Option<NodeId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub left: Option<NodeId>,
}

impl BinaryTreeNodeValue {
    pub fn builder() -> BinaryTreeNodeValueBuilder {
        BinaryTreeNodeValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BinaryTreeNodeValueBuilder {
    node_id: Option<NodeId>,
    val: Option<f64>,
    right: Option<NodeId>,
    left: Option<NodeId>,
}

impl BinaryTreeNodeValueBuilder {
    pub fn node_id(mut self, value: NodeId) -> Self {
        self.node_id = Some(value);
        self
    }

    pub fn val(mut self, value: f64) -> Self {
        self.val = Some(value);
        self
    }

    pub fn right(mut self, value: NodeId) -> Self {
        self.right = Some(value);
        self
    }

    pub fn left(mut self, value: NodeId) -> Self {
        self.left = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BinaryTreeNodeValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`node_id`](BinaryTreeNodeValueBuilder::node_id)
    /// - [`val`](BinaryTreeNodeValueBuilder::val)
    pub fn build(self) -> Result<BinaryTreeNodeValue, BuildError> {
        Ok(BinaryTreeNodeValue {
            node_id: self
                .node_id
                .ok_or_else(|| BuildError::missing_field("node_id"))?,
            val: self.val.ok_or_else(|| BuildError::missing_field("val"))?,
            right: self.right,
            left: self.left,
        })
    }
}
