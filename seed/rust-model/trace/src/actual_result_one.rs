pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ActualResultOne {
    #[serde(flatten)]
    pub exception_info_fields: ExceptionInfo,
    pub r#type: ActualResultOneType,
}

impl ActualResultOne {
    pub fn builder() -> ActualResultOneBuilder {
        <ActualResultOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ActualResultOneBuilder {
    exception_info_fields: Option<ExceptionInfo>,
    r#type: Option<ActualResultOneType>,
}

impl ActualResultOneBuilder {
    pub fn exception_info_fields(mut self, value: ExceptionInfo) -> Self {
        self.exception_info_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: ActualResultOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ActualResultOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`exception_info_fields`](ActualResultOneBuilder::exception_info_fields)
    /// - [`r#type`](ActualResultOneBuilder::r#type)
    pub fn build(self) -> Result<ActualResultOne, BuildError> {
        Ok(ActualResultOne {
            exception_info_fields: self.exception_info_fields.ok_or_else(|| BuildError::missing_field("exception_info_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
