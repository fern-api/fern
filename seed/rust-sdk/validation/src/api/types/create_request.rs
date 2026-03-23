pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateRequest {
    #[serde(default)]
    pub decimal: f64,
    #[serde(default)]
    pub even: i64,
    #[serde(default)]
    pub name: String,
    pub shape: Shape,
}

impl CreateRequest {
    pub fn builder() -> CreateRequestBuilder {
        CreateRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateRequestBuilder {
    decimal: Option<f64>,
    even: Option<i64>,
    name: Option<String>,
    shape: Option<Shape>,
}

impl CreateRequestBuilder {
    pub fn decimal(mut self, value: f64) -> Self {
        self.decimal = Some(value);
        self
    }

    pub fn even(mut self, value: i64) -> Self {
        self.even = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn shape(mut self, value: Shape) -> Self {
        self.shape = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`decimal`](CreateRequestBuilder::decimal)
    /// - [`even`](CreateRequestBuilder::even)
    /// - [`name`](CreateRequestBuilder::name)
    /// - [`shape`](CreateRequestBuilder::shape)
    pub fn build(self) -> Result<CreateRequest, BuildError> {
        Ok(CreateRequest {
            decimal: self
                .decimal
                .ok_or_else(|| BuildError::missing_field("decimal"))?,
            even: self.even.ok_or_else(|| BuildError::missing_field("even"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            shape: self
                .shape
                .ok_or_else(|| BuildError::missing_field("shape"))?,
        })
    }
}
