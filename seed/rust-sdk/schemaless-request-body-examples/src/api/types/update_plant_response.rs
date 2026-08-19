pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdatePlantResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}

impl UpdatePlantResponse {
    pub fn builder() -> UpdatePlantResponseBuilder {
        <UpdatePlantResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UpdatePlantResponseBuilder {
    id: Option<String>,
    name: Option<String>,
}

impl UpdatePlantResponseBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UpdatePlantResponse`].
    pub fn build(self) -> Result<UpdatePlantResponse, BuildError> {
        Ok(UpdatePlantResponse {
            id: self.id,
            name: self.name,
        })
    }
}
