pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderDResponse {
    #[serde(default)]
    pub foo: String,
}

impl FolderDResponse {
    pub fn builder() -> FolderDResponseBuilder {
        <FolderDResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderDResponseBuilder {
    foo: Option<String>,
}

impl FolderDResponseBuilder {
    pub fn foo(mut self, value: impl Into<String>) -> Self {
        self.foo = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FolderDResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo`](FolderDResponseBuilder::foo)
    pub fn build(self) -> Result<FolderDResponse, BuildError> {
        Ok(FolderDResponse {
            foo: self.foo.ok_or_else(|| BuildError::missing_field("foo"))?,
        })
    }
}
