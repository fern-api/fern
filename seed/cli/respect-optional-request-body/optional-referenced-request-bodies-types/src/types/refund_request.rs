pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct RefundRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::number_serializers::option")]
    pub amount: Option<f64>,
}

impl RefundRequest {
    pub fn builder() -> RefundRequestBuilder {
        <RefundRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RefundRequestBuilder {
    amount: Option<f64>,
}

impl RefundRequestBuilder {
    pub fn amount(mut self, value: f64) -> Self {
        self.amount = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RefundRequest`].
    pub fn build(self) -> Result<RefundRequest, BuildError> {
        Ok(RefundRequest {
            amount: self.amount,
        })
    }
}
