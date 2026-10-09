pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ImportItemResponse {
    #[serde(default)]
    pub imported: i64,
}

impl ImportItemResponse {
    pub fn builder() -> ImportItemResponseBuilder {
        <ImportItemResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ImportItemResponseBuilder {
    imported: Option<i64>,
}

impl ImportItemResponseBuilder {
    pub fn imported(mut self, value: i64) -> Self {
        self.imported = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ImportItemResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`imported`](ImportItemResponseBuilder::imported)
    pub fn build(self) -> Result<ImportItemResponse, BuildError> {
        Ok(ImportItemResponse {
            imported: self.imported.ok_or_else(|| BuildError::missing_field("imported"))?,
        })
    }
}
