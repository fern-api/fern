pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct LeafNode {
}

impl LeafNode {
    pub fn builder() -> LeafNodeBuilder {
        <LeafNodeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct LeafNodeBuilder {
}

impl LeafNodeBuilder {

    /// Consumes the builder and constructs a [`LeafNode`].
    pub fn build(self) -> Result<LeafNode, BuildError> {
        Ok(LeafNode {
        })
    }
}
