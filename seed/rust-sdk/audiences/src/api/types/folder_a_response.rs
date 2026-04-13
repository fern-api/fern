pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderAResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<FolderBFoo>,
}

impl FolderAResponse {
    pub fn builder() -> FolderAResponseBuilder {
        <FolderAResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderAResponseBuilder {
    foo: Option<FolderBFoo>,
}

impl FolderAResponseBuilder {
    pub fn foo(mut self, value: FolderBFoo) -> Self {
        self.foo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FolderAResponse`].
    pub fn build(self) -> Result<FolderAResponse, BuildError> {
        Ok(FolderAResponse { foo: self.foo })
    }
}
