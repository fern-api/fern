pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SinglyLinkedListNodeAndListValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(rename = "fullList")]
    #[serde(default)]
    pub full_list: SinglyLinkedListValue,
}

impl SinglyLinkedListNodeAndListValue {
    pub fn builder() -> SinglyLinkedListNodeAndListValueBuilder {
        SinglyLinkedListNodeAndListValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct SinglyLinkedListNodeAndListValueBuilder {
    node_id: Option<NodeId>,
    full_list: Option<SinglyLinkedListValue>,
}

impl SinglyLinkedListNodeAndListValueBuilder {
    pub fn node_id(mut self, value: NodeId) -> Self {
        self.node_id = Some(value);
        self
    }

    pub fn full_list(mut self, value: SinglyLinkedListValue) -> Self {
        self.full_list = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`SinglyLinkedListNodeAndListValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`node_id`](SinglyLinkedListNodeAndListValueBuilder::node_id)
    /// - [`full_list`](SinglyLinkedListNodeAndListValueBuilder::full_list)
    pub fn build(self) -> Result<SinglyLinkedListNodeAndListValue, BuildError> {
        Ok(SinglyLinkedListNodeAndListValue {
            node_id: self.node_id.ok_or_else(|| BuildError::missing_field("node_id"))?,
            full_list: self.full_list.ok_or_else(|| BuildError::missing_field("full_list"))?,
        })
    }
}
