pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2V3FunctionImplementation {
    #[serde(default)]
    pub r#impl: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imports: Option<String>,
}

impl V2V3FunctionImplementation {
    pub fn builder() -> V2V3FunctionImplementationBuilder {
        <V2V3FunctionImplementationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3FunctionImplementationBuilder {
    r#impl: Option<String>,
    imports: Option<String>,
}

impl V2V3FunctionImplementationBuilder {
    pub fn r#impl(mut self, value: impl Into<String>) -> Self {
        self.r#impl = Some(value.into());
        self
    }

    pub fn imports(mut self, value: impl Into<String>) -> Self {
        self.imports = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`V2V3FunctionImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#impl`](V2V3FunctionImplementationBuilder::r#impl)
    pub fn build(self) -> Result<V2V3FunctionImplementation, BuildError> {
        Ok(V2V3FunctionImplementation {
            r#impl: self
                .r#impl
                .ok_or_else(|| BuildError::missing_field("r#impl"))?,
            imports: self.imports,
        })
    }
}
