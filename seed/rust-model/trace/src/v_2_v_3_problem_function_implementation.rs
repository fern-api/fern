pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FunctionImplementation2 {
    #[serde(default)]
    pub r#impl: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imports: Option<String>,
}

impl FunctionImplementation2 {
    pub fn builder() -> FunctionImplementation2Builder {
        FunctionImplementation2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FunctionImplementation2Builder {
    r#impl: Option<String>,
    imports: Option<String>,
}

impl FunctionImplementation2Builder {
    pub fn r#impl(mut self, value: impl Into<String>) -> Self {
        self.r#impl = Some(value.into());
        self
    }

    pub fn imports(mut self, value: impl Into<String>) -> Self {
        self.imports = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FunctionImplementation2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#impl`](FunctionImplementation2Builder::r#impl)
    pub fn build(self) -> Result<FunctionImplementation2, BuildError> {
        Ok(FunctionImplementation2 {
            r#impl: self.r#impl.ok_or_else(|| BuildError::missing_field("r#impl"))?,
            imports: self.imports,
        })
    }
}
