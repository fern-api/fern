pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TreeBase {
    #[serde(flatten)]
    pub tree_identifiable_fields: TreeIdentifiable,
    #[serde(flatten)]
    pub tree_describable_fields: TreeDescribable,
    /// The species of tree.
    #[serde(rename = "treeSpecies")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tree_species: Option<String>,
    /// Height of the tree in feet.
    #[serde(rename = "heightInFeet")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub height_in_feet: Option<f64>,
}

impl TreeBase {
    pub fn builder() -> TreeBaseBuilder {
        <TreeBaseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TreeBaseBuilder {
    tree_identifiable_fields: Option<TreeIdentifiable>,
    tree_describable_fields: Option<TreeDescribable>,
    tree_species: Option<String>,
    height_in_feet: Option<f64>,
}

impl TreeBaseBuilder {
    pub fn tree_identifiable_fields(mut self, value: TreeIdentifiable) -> Self {
        self.tree_identifiable_fields = Some(value);
        self
    }

    pub fn tree_describable_fields(mut self, value: TreeDescribable) -> Self {
        self.tree_describable_fields = Some(value);
        self
    }

    pub fn tree_species(mut self, value: impl Into<String>) -> Self {
        self.tree_species = Some(value.into());
        self
    }

    pub fn height_in_feet(mut self, value: f64) -> Self {
        self.height_in_feet = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TreeBase`].
    /// This method will fail if any of the following fields are not set:
    /// - [`tree_identifiable_fields`](TreeBaseBuilder::tree_identifiable_fields)
    /// - [`tree_describable_fields`](TreeBaseBuilder::tree_describable_fields)
    pub fn build(self) -> Result<TreeBase, BuildError> {
        Ok(TreeBase {
            tree_identifiable_fields: self.tree_identifiable_fields.ok_or_else(|| BuildError::missing_field("tree_identifiable_fields"))?,
            tree_describable_fields: self.tree_describable_fields.ok_or_else(|| BuildError::missing_field("tree_describable_fields"))?,
            tree_species: self.tree_species,
            height_in_feet: self.height_in_feet,
        })
    }
}
