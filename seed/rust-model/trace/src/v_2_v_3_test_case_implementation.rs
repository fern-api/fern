pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3TestCaseImplementation {
    #[serde(default)]
    pub description: V2V3TestCaseImplementationDescription,
    pub function: V2V3TestCaseFunction,
}

impl V2V3TestCaseImplementation {
    pub fn builder() -> V2V3TestCaseImplementationBuilder {
        <V2V3TestCaseImplementationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseImplementationBuilder {
    description: Option<V2V3TestCaseImplementationDescription>,
    function: Option<V2V3TestCaseFunction>,
}

impl V2V3TestCaseImplementationBuilder {
    pub fn description(mut self, value: V2V3TestCaseImplementationDescription) -> Self {
        self.description = Some(value);
        self
    }

    pub fn function(mut self, value: V2V3TestCaseFunction) -> Self {
        self.function = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`description`](V2V3TestCaseImplementationBuilder::description)
    /// - [`function`](V2V3TestCaseImplementationBuilder::function)
    pub fn build(self) -> Result<V2V3TestCaseImplementation, BuildError> {
        Ok(V2V3TestCaseImplementation {
            description: self.description.ok_or_else(|| BuildError::missing_field("description"))?,
            function: self.function.ok_or_else(|| BuildError::missing_field("function"))?,
        })
    }
}
