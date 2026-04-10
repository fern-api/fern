pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3CustomFilesType {
    pub r#type: V2V3CustomFilesTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<HashMap<String, V2V3Files>>,
}

impl V2V3CustomFilesType {
    pub fn builder() -> V2V3CustomFilesTypeBuilder {
        <V2V3CustomFilesTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3CustomFilesTypeBuilder {
    r#type: Option<V2V3CustomFilesTypeType>,
    value: Option<HashMap<String, V2V3Files>>,
}

impl V2V3CustomFilesTypeBuilder {
    pub fn r#type(mut self, value: V2V3CustomFilesTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: HashMap<String, V2V3Files>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3CustomFilesType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](V2V3CustomFilesTypeBuilder::r#type)
    pub fn build(self) -> Result<V2V3CustomFilesType, BuildError> {
        Ok(V2V3CustomFilesType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
