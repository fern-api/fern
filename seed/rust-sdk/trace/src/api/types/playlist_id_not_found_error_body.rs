pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PlaylistIdNotFoundErrorBody {
    pub r#type: PlaylistIdNotFoundErrorBodyType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<PlaylistId>,
}

impl PlaylistIdNotFoundErrorBody {
    pub fn builder() -> PlaylistIdNotFoundErrorBodyBuilder {
        <PlaylistIdNotFoundErrorBodyBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PlaylistIdNotFoundErrorBodyBuilder {
    r#type: Option<PlaylistIdNotFoundErrorBodyType>,
    value: Option<PlaylistId>,
}

impl PlaylistIdNotFoundErrorBodyBuilder {
    pub fn r#type(mut self, value: PlaylistIdNotFoundErrorBodyType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: PlaylistId) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PlaylistIdNotFoundErrorBody`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](PlaylistIdNotFoundErrorBodyBuilder::r#type)
    pub fn build(self) -> Result<PlaylistIdNotFoundErrorBody, BuildError> {
        Ok(PlaylistIdNotFoundErrorBody {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
