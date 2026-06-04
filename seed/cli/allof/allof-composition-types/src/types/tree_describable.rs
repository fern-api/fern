pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TreeDescribable {
    /// Display name of the tree.
    #[serde(rename = "treeName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tree_name: Option<String>,
    /// A description of the tree.
    #[serde(rename = "treeDescription")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tree_description: Option<String>,
}

impl TreeDescribable {
    pub fn builder() -> TreeDescribableBuilder {
        <TreeDescribableBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TreeDescribableBuilder {
    tree_name: Option<String>,
    tree_description: Option<String>,
}

impl TreeDescribableBuilder {
    pub fn tree_name(mut self, value: impl Into<String>) -> Self {
        self.tree_name = Some(value.into());
        self
    }

    pub fn tree_description(mut self, value: impl Into<String>) -> Self {
        self.tree_description = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TreeDescribable`].
    pub fn build(self) -> Result<TreeDescribable, BuildError> {
        Ok(TreeDescribable {
            tree_name: self.tree_name,
            tree_description: self.tree_description,
        })
    }
}
