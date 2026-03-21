pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NodesWrapper {
    #[serde(default)]
    pub nodes: Vec<Vec<Node>>,
}
