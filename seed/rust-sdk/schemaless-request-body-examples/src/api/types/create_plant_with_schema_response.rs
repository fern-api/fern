pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreatePlantWithSchemaResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl CreatePlantWithSchemaResponse {
    pub fn builder() -> CreatePlantWithSchemaResponseBuilder {
        <CreatePlantWithSchemaResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreatePlantWithSchemaResponseBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl CreatePlantWithSchemaResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreatePlantWithSchemaResponse`].
    pub fn build(self) -> Result<CreatePlantWithSchemaResponse, BuildError> {
        Ok(CreatePlantWithSchemaResponse {
            id: self.id,
            name: self.name,
        })
    }
}
