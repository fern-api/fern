pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InvalidRequestCauseTwo {
    #[serde(flatten)]
    pub unexpected_language_error_fields: UnexpectedLanguageError,
    pub r#type: InvalidRequestCauseTwoType,
}

impl InvalidRequestCauseTwo {
    pub fn builder() -> InvalidRequestCauseTwoBuilder {
        <InvalidRequestCauseTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct InvalidRequestCauseTwoBuilder {
    unexpected_language_error_fields: Option<UnexpectedLanguageError>,
    r#type: Option<InvalidRequestCauseTwoType>,
}

impl InvalidRequestCauseTwoBuilder {
    pub fn unexpected_language_error_fields(mut self, value: UnexpectedLanguageError) -> Self {
        self.unexpected_language_error_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: InvalidRequestCauseTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`InvalidRequestCauseTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`unexpected_language_error_fields`](InvalidRequestCauseTwoBuilder::unexpected_language_error_fields)
    /// - [`r#type`](InvalidRequestCauseTwoBuilder::r#type)
    pub fn build(self) -> Result<InvalidRequestCauseTwo, BuildError> {
        Ok(InvalidRequestCauseTwo {
            unexpected_language_error_fields: self
                .unexpected_language_error_fields
                .ok_or_else(|| BuildError::missing_field("unexpected_language_error_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
