pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TreeRecord {
    #[serde(flatten)]
    pub tree_base_fields: TreeBase,
    /// Date the tree was planted.
    #[serde(rename = "plantedDate")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub planted_date: Option<NaiveDate>,
}

impl TreeRecord {
    pub fn builder() -> TreeRecordBuilder {
        <TreeRecordBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TreeRecordBuilder {
    tree_base_fields: Option<TreeBase>,
    planted_date: Option<NaiveDate>,
}

impl TreeRecordBuilder {
    pub fn tree_base_fields(mut self, value: TreeBase) -> Self {
        self.tree_base_fields = Some(value);
        self
    }

    pub fn planted_date(mut self, value: NaiveDate) -> Self {
        self.planted_date = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TreeRecord`].
    /// This method will fail if any of the following fields are not set:
    /// - [`tree_base_fields`](TreeRecordBuilder::tree_base_fields)
    pub fn build(self) -> Result<TreeRecord, BuildError> {
        Ok(TreeRecord {
            tree_base_fields: self.tree_base_fields.ok_or_else(|| BuildError::missing_field("tree_base_fields"))?,
            planted_date: self.planted_date,
        })
    }
}
