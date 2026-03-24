pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Tree {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<Node>>,
}

impl Tree {
    pub fn builder() -> TreeBuilder {
        TreeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TreeBuilder {
    nodes: Option<Vec<Node>>,
}

impl TreeBuilder {
    pub fn nodes(mut self, value: Vec<Node>) -> Self {
        self.nodes = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Tree`].
    pub fn build(self) -> Result<Tree, BuildError> {
        Ok(Tree {
            nodes: self.nodes,
        })
    }
}
