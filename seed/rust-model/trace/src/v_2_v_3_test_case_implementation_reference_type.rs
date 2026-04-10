pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2V3TestCaseImplementationReferenceType {
    pub r#type: V2V3TestCaseImplementationReferenceTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<V2V3TestCaseTemplateId>,
}

impl V2V3TestCaseImplementationReferenceType {
    pub fn builder() -> V2V3TestCaseImplementationReferenceTypeBuilder {
        <V2V3TestCaseImplementationReferenceTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseImplementationReferenceTypeBuilder {
    r#type: Option<V2V3TestCaseImplementationReferenceTypeType>,
    value: Option<V2V3TestCaseTemplateId>,
}

impl V2V3TestCaseImplementationReferenceTypeBuilder {
    pub fn r#type(mut self, value: V2V3TestCaseImplementationReferenceTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: V2V3TestCaseTemplateId) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseImplementationReferenceType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](V2V3TestCaseImplementationReferenceTypeBuilder::r#type)
    pub fn build(self) -> Result<V2V3TestCaseImplementationReferenceType, BuildError> {
        Ok(V2V3TestCaseImplementationReferenceType {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
