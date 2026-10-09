pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TreeBase {
    /// Unique tree identifier.
    #[serde(default)]
    pub id: String,
    /// Display name of the tree.
    #[serde(rename = "treeName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tree_name: Option<String>,
    /// A description of the tree.
    #[serde(rename = "treeDescription")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tree_description: Option<String>,
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
    id: Option<String>,
    tree_name: Option<String>,
    tree_description: Option<String>,
    tree_species: Option<String>,
    height_in_feet: Option<f64>,
}

impl TreeBaseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn tree_name(mut self, value: impl Into<String>) -> Self {
        self.tree_name = Some(value.into());
        self
    }

    pub fn tree_description(mut self, value: impl Into<String>) -> Self {
        self.tree_description = Some(value.into());
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
    /// - [`id`](TreeBaseBuilder::id)
    pub fn build(self) -> Result<TreeBase, BuildError> {
        Ok(TreeBase {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            tree_name: self.tree_name,
            tree_description: self.tree_description,
            tree_species: self.tree_species,
            height_in_feet: self.height_in_feet,
        })
    }
}
