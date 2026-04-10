pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2TestCaseImplementationReferenceType {
    pub r#type: V2TestCaseImplementationReferenceTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<V2TestCaseTemplateId>,
}

impl V2TestCaseImplementationReferenceType {
    pub fn builder() -> V2TestCaseImplementationReferenceTypeBuilder {
        <V2TestCaseImplementationReferenceTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseImplementationReferenceTypeBuilder {
    r#type: Option<V2TestCaseImplementationReferenceTypeType>,
    value: Option<V2TestCaseTemplateId>,
}

impl V2TestCaseImplementationReferenceTypeBuilder {
    pub fn r#type(mut self, value: V2TestCaseImplementationReferenceTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: V2TestCaseTemplateId) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseImplementationReferenceType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](V2TestCaseImplementationReferenceTypeBuilder::r#type)
    pub fn build(self) -> Result<V2TestCaseImplementationReferenceType, BuildError> {
        Ok(V2TestCaseImplementationReferenceType {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
