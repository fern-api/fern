pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ImportItemRequest {
    #[serde(default)]
    pub item: CatalogItem,
    #[serde(rename = "dryRun")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dry_run: Option<bool>,
}

impl ImportItemRequest {
    pub fn builder() -> ImportItemRequestBuilder {
        <ImportItemRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ImportItemRequestBuilder {
    item: Option<CatalogItem>,
    dry_run: Option<bool>,
}

impl ImportItemRequestBuilder {
    pub fn item(mut self, value: CatalogItem) -> Self {
        self.item = Some(value);
        self
    }

    pub fn dry_run(mut self, value: bool) -> Self {
        self.dry_run = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ImportItemRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`item`](ImportItemRequestBuilder::item)
    pub fn build(self) -> Result<ImportItemRequest, BuildError> {
        Ok(ImportItemRequest {
            item: self.item.ok_or_else(|| BuildError::missing_field("item"))?,
            dry_run: self.dry_run,
        })
    }
}

