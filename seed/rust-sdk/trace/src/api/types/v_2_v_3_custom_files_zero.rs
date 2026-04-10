pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3CustomFilesZero {
    #[serde(flatten)]
    pub v2v3basic_custom_files_fields: V2V3BasicCustomFiles,
    pub r#type: V2V3CustomFilesZeroType,
}

impl V2V3CustomFilesZero {
    pub fn builder() -> V2V3CustomFilesZeroBuilder {
        <V2V3CustomFilesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3CustomFilesZeroBuilder {
    v2v3basic_custom_files_fields: Option<V2V3BasicCustomFiles>,
    r#type: Option<V2V3CustomFilesZeroType>,
}

impl V2V3CustomFilesZeroBuilder {
    pub fn v2v3basic_custom_files_fields(mut self, value: V2V3BasicCustomFiles) -> Self {
        self.v2v3basic_custom_files_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2V3CustomFilesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3CustomFilesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2v3basic_custom_files_fields`](V2V3CustomFilesZeroBuilder::v2v3basic_custom_files_fields)
    /// - [`r#type`](V2V3CustomFilesZeroBuilder::r#type)
    pub fn build(self) -> Result<V2V3CustomFilesZero, BuildError> {
        Ok(V2V3CustomFilesZero {
            v2v3basic_custom_files_fields: self
                .v2v3basic_custom_files_fields
                .ok_or_else(|| BuildError::missing_field("v2v3basic_custom_files_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
