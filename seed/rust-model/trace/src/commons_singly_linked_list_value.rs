pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SinglyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    #[serde(default)]
    pub nodes: HashMap<NodeId, SinglyLinkedListNodeValue>,
}

impl SinglyLinkedListValue {
    pub fn builder() -> SinglyLinkedListValueBuilder {
        SinglyLinkedListValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SinglyLinkedListValueBuilder {
    head: Option<NodeId>,
    nodes: Option<HashMap<NodeId, SinglyLinkedListNodeValue>>,
}

impl SinglyLinkedListValueBuilder {
    pub fn head(mut self, value: NodeId) -> Self {
        self.head = Some(value);
        self
    }

    pub fn nodes(mut self, value: HashMap<NodeId, SinglyLinkedListNodeValue>) -> Self {
        self.nodes = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SinglyLinkedListValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`nodes`](SinglyLinkedListValueBuilder::nodes)
    pub fn build(self) -> Result<SinglyLinkedListValue, BuildError> {
        Ok(SinglyLinkedListValue {
            head: self.head,
            nodes: self.nodes.ok_or_else(|| BuildError::missing_field("nodes"))?,
        })
    }
}
