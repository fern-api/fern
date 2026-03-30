pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SinglyLinkedListNodeValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(default)]
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NodeId>,
}

impl SinglyLinkedListNodeValue {
    pub fn builder() -> SinglyLinkedListNodeValueBuilder {
        <SinglyLinkedListNodeValueBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SinglyLinkedListNodeValueBuilder {
    node_id: Option<NodeId>,
    val: Option<f64>,
    next: Option<NodeId>,
}

impl SinglyLinkedListNodeValueBuilder {
    pub fn node_id(mut self, value: NodeId) -> Self {
        self.node_id = Some(value);
        self
    }

    pub fn val(mut self, value: f64) -> Self {
        self.val = Some(value);
        self
    }

    pub fn next(mut self, value: NodeId) -> Self {
        self.next = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SinglyLinkedListNodeValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`node_id`](SinglyLinkedListNodeValueBuilder::node_id)
    /// - [`val`](SinglyLinkedListNodeValueBuilder::val)
    pub fn build(self) -> Result<SinglyLinkedListNodeValue, BuildError> {
        Ok(SinglyLinkedListNodeValue {
            node_id: self.node_id.ok_or_else(|| BuildError::missing_field("node_id"))?,
            val: self.val.ok_or_else(|| BuildError::missing_field("val"))?,
            next: self.next,
        })
    }
}
