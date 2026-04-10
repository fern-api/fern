pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BigUnionEleven {
    #[serde(flatten)]
    pub false_mirror_fields: FalseMirror,
    pub r#type: BigUnionElevenType,
}

impl BigUnionEleven {
    pub fn builder() -> BigUnionElevenBuilder {
        <BigUnionElevenBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BigUnionElevenBuilder {
    false_mirror_fields: Option<FalseMirror>,
    r#type: Option<BigUnionElevenType>,
}

impl BigUnionElevenBuilder {
    pub fn false_mirror_fields(mut self, value: FalseMirror) -> Self {
        self.false_mirror_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: BigUnionElevenType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BigUnionEleven`].
    /// This method will fail if any of the following fields are not set:
    /// - [`false_mirror_fields`](BigUnionElevenBuilder::false_mirror_fields)
    /// - [`r#type`](BigUnionElevenBuilder::r#type)
    pub fn build(self) -> Result<BigUnionEleven, BuildError> {
        Ok(BigUnionEleven {
            false_mirror_fields: self
                .false_mirror_fields
                .ok_or_else(|| BuildError::missing_field("false_mirror_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
