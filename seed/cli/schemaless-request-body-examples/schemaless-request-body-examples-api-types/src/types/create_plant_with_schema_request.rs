pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreatePlantWithSchemaRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub species: Option<String>,
}

impl CreatePlantWithSchemaRequest {
    pub fn builder() -> CreatePlantWithSchemaRequestBuilder {
        <CreatePlantWithSchemaRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreatePlantWithSchemaRequestBuilder {
    name: Option<String>,
    species: Option<String>,
}

impl CreatePlantWithSchemaRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn species(mut self, value: impl Into<String>) -> Self {
        self.species = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreatePlantWithSchemaRequest`].
    pub fn build(self) -> Result<CreatePlantWithSchemaRequest, BuildError> {
        Ok(CreatePlantWithSchemaRequest {
            name: self.name,
            species: self.species,
        })
    }
}

