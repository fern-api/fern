pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderDResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<FolderBFoo>,
}

impl FolderDResponse {
    pub fn builder() -> FolderDResponseBuilder {
        <FolderDResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderDResponseBuilder {
    foo: Option<FolderBFoo>,
}

impl FolderDResponseBuilder {
    pub fn foo(mut self, value: FolderBFoo) -> Self {
        self.foo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FolderDResponse`].
    pub fn build(self) -> Result<FolderDResponse, BuildError> {
        Ok(FolderDResponse { foo: self.foo })
    }
}
