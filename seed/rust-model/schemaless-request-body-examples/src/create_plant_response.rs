pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CreatePlantResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl CreatePlantResponse {
    pub fn builder() -> CreatePlantResponseBuilder {
        <CreatePlantResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreatePlantResponseBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl CreatePlantResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CreatePlantResponse`].
    pub fn build(self) -> Result<CreatePlantResponse, BuildError> {
        Ok(CreatePlantResponse {
            id: self.id,
            name: self.name,
        })
    }
}
