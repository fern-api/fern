pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct A {
    #[serde(flatten)]
    pub root_type_fields: RootType,
}

impl A {
    pub fn builder() -> ABuilder {
        <ABuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ABuilder {
    root_type_fields: Option<RootType>,
}

impl ABuilder {
    pub fn root_type_fields(mut self, value: RootType) -> Self {
        self.root_type_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`A`].
    /// This method will fail if any of the following fields are not set:
    /// - [`root_type_fields`](ABuilder::root_type_fields)
    pub fn build(self) -> Result<A, BuildError> {
        Ok(A {
            root_type_fields: self
                .root_type_fields
                .ok_or_else(|| BuildError::missing_field("root_type_fields"))?,
        })
    }
}
