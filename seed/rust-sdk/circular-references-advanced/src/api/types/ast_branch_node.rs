pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(transparent)]
pub struct BranchNode {
    pub children: Vec<Box<Node>>,
}

impl BranchNode {
    pub fn builder() -> BranchNodeBuilder {
        <BranchNodeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BranchNodeBuilder {
    children: Option<Vec<Box<Node>>>,
}

impl BranchNodeBuilder {
    pub fn children(mut self, value: Vec<Box<Node>>) -> Self {
        self.children = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BranchNode`].
    /// This method will fail if any of the following fields are not set:
    /// - [`children`](BranchNodeBuilder::children)
    pub fn build(self) -> Result<BranchNode, BuildError> {
        Ok(BranchNode {
            children: self
                .children
                .ok_or_else(|| BuildError::missing_field("children"))?,
        })
    }
}
