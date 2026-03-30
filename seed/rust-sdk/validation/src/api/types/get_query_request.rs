pub use crate::prelude::*;

/// Query parameters for get
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetQueryRequest {
    #[serde(default)]
    pub decimal: f64,
    #[serde(default)]
    pub even: i64,
    #[serde(default)]
    pub name: String,
}

impl GetQueryRequest {
    pub fn builder() -> GetQueryRequestBuilder {
        <GetQueryRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetQueryRequestBuilder {
    decimal: Option<f64>,
    even: Option<i64>,
    name: Option<String>,
}

impl GetQueryRequestBuilder {
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

    /// Consumes the builder and constructs a [`GetQueryRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`decimal`](GetQueryRequestBuilder::decimal)
    /// - [`even`](GetQueryRequestBuilder::even)
    /// - [`name`](GetQueryRequestBuilder::name)
    pub fn build(self) -> Result<GetQueryRequest, BuildError> {
        Ok(GetQueryRequest {
            decimal: self
                .decimal
                .ok_or_else(|| BuildError::missing_field("decimal"))?,
            even: self.even.ok_or_else(|| BuildError::missing_field("even"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
