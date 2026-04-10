pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FolderBFoo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foo: Option<FolderCFoo>,
}

impl FolderBFoo {
    pub fn builder() -> FolderBFooBuilder {
        <FolderBFooBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FolderBFooBuilder {
    foo: Option<FolderCFoo>,
}

impl FolderBFooBuilder {
    pub fn foo(mut self, value: FolderCFoo) -> Self {
        self.foo = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FolderBFoo`].
    pub fn build(self) -> Result<FolderBFoo, BuildError> {
        Ok(FolderBFoo {
            foo: self.foo,
        })
    }
}
