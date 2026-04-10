pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2CustomFilesType {
    pub r#type: V2CustomFilesTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<HashMap<String, V2Files>>,
}

impl V2CustomFilesType {
    pub fn builder() -> V2CustomFilesTypeBuilder {
        <V2CustomFilesTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2CustomFilesTypeBuilder {
    r#type: Option<V2CustomFilesTypeType>,
    value: Option<HashMap<String, V2Files>>,
}

impl V2CustomFilesTypeBuilder {
    pub fn r#type(mut self, value: V2CustomFilesTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: HashMap<String, V2Files>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2CustomFilesType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](V2CustomFilesTypeBuilder::r#type)
    pub fn build(self) -> Result<V2CustomFilesType, BuildError> {
        Ok(V2CustomFilesType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
