pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FunctionImplementation {
    #[serde(default)]
    pub r#impl: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imports: Option<String>,
}

impl FunctionImplementation {
    pub fn builder() -> FunctionImplementationBuilder {
        <FunctionImplementationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FunctionImplementationBuilder {
    r#impl: Option<String>,
    imports: Option<String>,
}

impl FunctionImplementationBuilder {
    pub fn r#impl(mut self, value: impl Into<String>) -> Self {
        self.r#impl = Some(value.into());
        self
    }

    pub fn imports(mut self, value: impl Into<String>) -> Self {
        self.imports = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`FunctionImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#impl`](FunctionImplementationBuilder::r#impl)
    pub fn build(self) -> Result<FunctionImplementation, BuildError> {
        Ok(FunctionImplementation {
            r#impl: self.r#impl.ok_or_else(|| BuildError::missing_field("r#impl"))?,
            imports: self.imports,
        })
    }
}
