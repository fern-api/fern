pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BaseType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub child_ref: Option<ChildType>,
}

impl BaseType {
    pub fn builder() -> BaseTypeBuilder {
        <BaseTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BaseTypeBuilder {
    child_ref: Option<ChildType>,
}

impl BaseTypeBuilder {
    pub fn child_ref(mut self, value: ChildType) -> Self {
        self.child_ref = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BaseType`].
    pub fn build(self) -> Result<BaseType, BuildError> {
        Ok(BaseType {
            child_ref: self.child_ref,
        })
    }
}
