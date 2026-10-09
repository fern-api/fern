pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TreeRecord {
    #[serde(flatten)]
    pub tree_identifiable_fields: TreeIdentifiable,
    /// Display name of the tree.
    #[serde(rename = "treeName")]
    #[serde(default)]
    pub tree_name: String,
    /// The species of tree.
    #[serde(rename = "treeSpecies")]
    #[serde(default)]
    pub tree_species: String,
    /// Date the tree was planted.
    #[serde(rename = "plantedDate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub planted_date: Option<NaiveDate>,
    /// Height of the tree in feet.
    #[serde(rename = "heightInFeet")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub height_in_feet: Option<f64>,
    /// A description of the tree.
    #[serde(rename = "treeDescription")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tree_description: Option<String>,
}

impl TreeRecord {
    pub fn builder() -> TreeRecordBuilder {
        <TreeRecordBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TreeRecordBuilder {
    tree_identifiable_fields: Option<TreeIdentifiable>,
    tree_name: Option<String>,
    tree_species: Option<String>,
    planted_date: Option<NaiveDate>,
    height_in_feet: Option<f64>,
    tree_description: Option<String>,
}

impl TreeRecordBuilder {
    pub fn tree_identifiable_fields(mut self, value: TreeIdentifiable) -> Self {
        self.tree_identifiable_fields = Some(value);
        self
    }

    pub fn tree_name(mut self, value: impl Into<String>) -> Self {
        self.tree_name = Some(value.into());
        self
    }

    pub fn tree_species(mut self, value: impl Into<String>) -> Self {
        self.tree_species = Some(value.into());
        self
    }

    pub fn planted_date(mut self, value: NaiveDate) -> Self {
        self.planted_date = Some(value);
        self
    }

    pub fn height_in_feet(mut self, value: f64) -> Self {
        self.height_in_feet = Some(value);
        self
    }

    pub fn tree_description(mut self, value: impl Into<String>) -> Self {
        self.tree_description = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`TreeRecord`].
    /// This method will fail if any of the following fields are not set:
    /// - [`tree_identifiable_fields`](TreeRecordBuilder::tree_identifiable_fields)
    /// - [`tree_name`](TreeRecordBuilder::tree_name)
    /// - [`tree_species`](TreeRecordBuilder::tree_species)
    pub fn build(self) -> Result<TreeRecord, BuildError> {
        Ok(TreeRecord {
            tree_identifiable_fields: self
                .tree_identifiable_fields
                .ok_or_else(|| BuildError::missing_field("tree_identifiable_fields"))?,
            tree_name: self
                .tree_name
                .ok_or_else(|| BuildError::missing_field("tree_name"))?,
            tree_species: self
                .tree_species
                .ok_or_else(|| BuildError::missing_field("tree_species"))?,
            planted_date: self.planted_date,
            height_in_feet: self.height_in_feet,
            tree_description: self.tree_description,
        })
    }
}
