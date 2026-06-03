pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CatalogImage {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub create_request: Option<CreateCatalogImageRequest>,
}

impl CatalogImage {
    pub fn builder() -> CatalogImageBuilder {
        <CatalogImageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CatalogImageBuilder {
    id: Option<String>,
    caption: Option<String>,
    url: Option<String>,
    create_request: Option<CreateCatalogImageRequest>,
}

impl CatalogImageBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn caption(mut self, value: impl Into<String>) -> Self {
        self.caption = Some(value.into());
        self
    }

    pub fn url(mut self, value: impl Into<String>) -> Self {
        self.url = Some(value.into());
        self
    }

    pub fn create_request(mut self, value: CreateCatalogImageRequest) -> Self {
        self.create_request = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CatalogImage`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](CatalogImageBuilder::id)
    pub fn build(self) -> Result<CatalogImage, BuildError> {
        Ok(CatalogImage {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            caption: self.caption,
            url: self.url,
            create_request: self.create_request,
        })
    }
}
