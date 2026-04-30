pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreateCatalogImageRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
    #[serde(default)]
    pub catalog_object_id: String,
}

impl CreateCatalogImageRequest {
    pub fn builder() -> CreateCatalogImageRequestBuilder {
        <CreateCatalogImageRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateCatalogImageRequestBuilder {
    caption: Option<String>,
    catalog_object_id: Option<String>,
}

impl CreateCatalogImageRequestBuilder {
    pub fn caption(mut self, value: impl Into<String>) -> Self {
        self.caption = Some(value.into());
        self
    }

    pub fn catalog_object_id(mut self, value: impl Into<String>) -> Self {
        self.catalog_object_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreateCatalogImageRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`catalog_object_id`](CreateCatalogImageRequestBuilder::catalog_object_id)
    pub fn build(self) -> Result<CreateCatalogImageRequest, BuildError> {
        Ok(CreateCatalogImageRequest {
            caption: self.caption,
            catalog_object_id: self
                .catalog_object_id
                .ok_or_else(|| BuildError::missing_field("catalog_object_id"))?,
        })
    }
}
