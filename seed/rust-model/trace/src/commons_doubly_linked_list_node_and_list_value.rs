pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DoublyLinkedListNodeAndListValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(rename = "fullList")]
    #[serde(default)]
    pub full_list: DoublyLinkedListValue,
}

impl DoublyLinkedListNodeAndListValue {
    pub fn builder() -> DoublyLinkedListNodeAndListValueBuilder {
        DoublyLinkedListNodeAndListValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DoublyLinkedListNodeAndListValueBuilder {
    node_id: Option<NodeId>,
    full_list: Option<DoublyLinkedListValue>,
}

impl DoublyLinkedListNodeAndListValueBuilder {
    pub fn node_id(mut self, value: NodeId) -> Self {
        self.node_id = Some(value);
        self
    }

    pub fn full_list(mut self, value: DoublyLinkedListValue) -> Self {
        self.full_list = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DoublyLinkedListNodeAndListValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`node_id`](DoublyLinkedListNodeAndListValueBuilder::node_id)
    /// - [`full_list`](DoublyLinkedListNodeAndListValueBuilder::full_list)
    pub fn build(self) -> Result<DoublyLinkedListNodeAndListValue, BuildError> {
        Ok(DoublyLinkedListNodeAndListValue {
            node_id: self.node_id.ok_or_else(|| BuildError::missing_field("node_id"))?,
            full_list: self.full_list.ok_or_else(|| BuildError::missing_field("full_list"))?,
        })
    }
}
