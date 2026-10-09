pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ModelPage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub models: Option<Vec<Model>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<PaginationMetadata>,
}

impl ModelPage {
    pub fn builder() -> ModelPageBuilder {
        <ModelPageBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelPageBuilder {
    models: Option<Vec<Model>>,
    meta: Option<PaginationMetadata>,
}

impl ModelPageBuilder {
    pub fn models(mut self, value: Vec<Model>) -> Self {
        self.models = Some(value);
        self
    }

    pub fn meta(mut self, value: PaginationMetadata) -> Self {
        self.meta = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ModelPage`].
    pub fn build(self) -> Result<ModelPage, BuildError> {
        Ok(ModelPage {
            models: self.models,
            meta: self.meta,
        })
    }
}
