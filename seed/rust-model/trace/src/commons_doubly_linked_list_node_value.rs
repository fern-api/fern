pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DoublyLinkedListNodeValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(default)]
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NodeId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev: Option<NodeId>,
}

impl DoublyLinkedListNodeValue {
    pub fn builder() -> DoublyLinkedListNodeValueBuilder {
        DoublyLinkedListNodeValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DoublyLinkedListNodeValueBuilder {
    node_id: Option<NodeId>,
    val: Option<f64>,
    next: Option<NodeId>,
    prev: Option<NodeId>,
}

impl DoublyLinkedListNodeValueBuilder {
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

    pub fn prev(mut self, value: NodeId) -> Self {
        self.prev = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DoublyLinkedListNodeValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`node_id`](DoublyLinkedListNodeValueBuilder::node_id)
    /// - [`val`](DoublyLinkedListNodeValueBuilder::val)
    pub fn build(self) -> Result<DoublyLinkedListNodeValue, BuildError> {
        Ok(DoublyLinkedListNodeValue {
            node_id: self.node_id.ok_or_else(|| BuildError::missing_field("node_id"))?,
            val: self.val.ok_or_else(|| BuildError::missing_field("val"))?,
            next: self.next,
            prev: self.prev,
        })
    }
}
