pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2CustomFilesZero {
    #[serde(flatten)]
    pub v2basic_custom_files_fields: V2BasicCustomFiles,
    pub r#type: V2CustomFilesZeroType,
}

impl V2CustomFilesZero {
    pub fn builder() -> V2CustomFilesZeroBuilder {
        <V2CustomFilesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2CustomFilesZeroBuilder {
    v2basic_custom_files_fields: Option<V2BasicCustomFiles>,
    r#type: Option<V2CustomFilesZeroType>,
}

impl V2CustomFilesZeroBuilder {
    pub fn v2basic_custom_files_fields(mut self, value: V2BasicCustomFiles) -> Self {
        self.v2basic_custom_files_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: V2CustomFilesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2CustomFilesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`v2basic_custom_files_fields`](V2CustomFilesZeroBuilder::v2basic_custom_files_fields)
    /// - [`r#type`](V2CustomFilesZeroBuilder::r#type)
    pub fn build(self) -> Result<V2CustomFilesZero, BuildError> {
        Ok(V2CustomFilesZero {
            v2basic_custom_files_fields: self.v2basic_custom_files_fields.ok_or_else(|| BuildError::missing_field("v2basic_custom_files_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
