pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionTestCamelCasePropertiesRequest {
    #[serde(rename = "paymentMethod")]
    pub payment_method: PaymentMethodUnion,
}

impl UnionTestCamelCasePropertiesRequest {
    pub fn builder() -> UnionTestCamelCasePropertiesRequestBuilder {
        <UnionTestCamelCasePropertiesRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionTestCamelCasePropertiesRequestBuilder {
    payment_method: Option<PaymentMethodUnion>,
}

impl UnionTestCamelCasePropertiesRequestBuilder {
    pub fn payment_method(mut self, value: PaymentMethodUnion) -> Self {
        self.payment_method = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionTestCamelCasePropertiesRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`payment_method`](UnionTestCamelCasePropertiesRequestBuilder::payment_method)
    pub fn build(self) -> Result<UnionTestCamelCasePropertiesRequest, BuildError> {
        Ok(UnionTestCamelCasePropertiesRequest {
            payment_method: self.payment_method.ok_or_else(|| BuildError::missing_field("payment_method"))?,
        })
    }
}

