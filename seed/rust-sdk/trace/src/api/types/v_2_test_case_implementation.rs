pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2TestCaseImplementation {
    #[serde(default)]
    pub description: V2TestCaseImplementationDescription,
    pub function: V2TestCaseFunction,
}

impl V2TestCaseImplementation {
    pub fn builder() -> V2TestCaseImplementationBuilder {
        <V2TestCaseImplementationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseImplementationBuilder {
    description: Option<V2TestCaseImplementationDescription>,
    function: Option<V2TestCaseFunction>,
}

impl V2TestCaseImplementationBuilder {
    pub fn description(mut self, value: V2TestCaseImplementationDescription) -> Self {
        self.description = Some(value);
        self
    }

    pub fn function(mut self, value: V2TestCaseFunction) -> Self {
        self.function = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2TestCaseImplementation`].
    /// This method will fail if any of the following fields are not set:
    /// - [`description`](V2TestCaseImplementationBuilder::description)
    /// - [`function`](V2TestCaseImplementationBuilder::function)
    pub fn build(self) -> Result<V2TestCaseImplementation, BuildError> {
        Ok(V2TestCaseImplementation {
            description: self
                .description
                .ok_or_else(|| BuildError::missing_field("description"))?,
            function: self
                .function
                .ok_or_else(|| BuildError::missing_field("function"))?,
        })
    }
}
