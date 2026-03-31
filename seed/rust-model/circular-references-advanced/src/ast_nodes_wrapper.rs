pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NodesWrapper {
    #[serde(default)]
    pub nodes: Vec<Vec<Node>>,
}

impl NodesWrapper {
    pub fn builder() -> NodesWrapperBuilder {
        <NodesWrapperBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NodesWrapperBuilder {
    nodes: Option<Vec<Vec<Node>>>,
}

impl NodesWrapperBuilder {
    pub fn nodes(mut self, value: Vec<Vec<Node>>) -> Self {
        self.nodes = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NodesWrapper`].
    /// This method will fail if any of the following fields are not set:
    /// - [`nodes`](NodesWrapperBuilder::nodes)
    pub fn build(self) -> Result<NodesWrapper, BuildError> {
        Ok(NodesWrapper {
            nodes: self.nodes.ok_or_else(|| BuildError::missing_field("nodes"))?,
        })
    }
}
