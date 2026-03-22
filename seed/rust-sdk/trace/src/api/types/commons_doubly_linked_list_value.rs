pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DoublyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    #[serde(default)]
    pub nodes: HashMap<NodeId, DoublyLinkedListNodeValue>,
}

impl DoublyLinkedListValue {
    pub fn builder() -> DoublyLinkedListValueBuilder {
        DoublyLinkedListValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DoublyLinkedListValueBuilder {
    head: Option<NodeId>,
    nodes: Option<HashMap<NodeId, DoublyLinkedListNodeValue>>,
}

impl DoublyLinkedListValueBuilder {
    pub fn head(mut self, value: NodeId) -> Self {
        self.head = Some(value);
        self
    }

    pub fn nodes(mut self, value: HashMap<NodeId, DoublyLinkedListNodeValue>) -> Self {
        self.nodes = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DoublyLinkedListValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`nodes`](DoublyLinkedListValueBuilder::nodes)
    pub fn build(self) -> Result<DoublyLinkedListValue, BuildError> {
        Ok(DoublyLinkedListValue {
            head: self.head,
            nodes: self
                .nodes
                .ok_or_else(|| BuildError::missing_field("nodes"))?,
        })
    }
}
