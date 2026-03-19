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