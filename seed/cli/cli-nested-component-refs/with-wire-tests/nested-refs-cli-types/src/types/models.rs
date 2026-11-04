pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Models {
    #[serde(rename = "Address")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<ModelsAddress>,
    #[serde(rename = "LineItem")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_item: Option<ModelsLineItem>,
    #[serde(rename = "OrderRequest")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order_request: Option<ModelsOrderRequest>,
    #[serde(rename = "Order")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<ModelsOrder>,
}

impl Models {
    pub fn builder() -> ModelsBuilder {
        <ModelsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ModelsBuilder {
    address: Option<ModelsAddress>,
    line_item: Option<ModelsLineItem>,
    order_request: Option<ModelsOrderRequest>,
    order: Option<ModelsOrder>,
}

impl ModelsBuilder {
    pub fn address(mut self, value: ModelsAddress) -> Self {
        self.address = Some(value);
        self
    }

    pub fn line_item(mut self, value: ModelsLineItem) -> Self {
        self.line_item = Some(value);
        self
    }

    pub fn order_request(mut self, value: ModelsOrderRequest) -> Self {
        self.order_request = Some(value);
        self
    }

    pub fn order(mut self, value: ModelsOrder) -> Self {
        self.order = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Models`].
    pub fn build(self) -> Result<Models, BuildError> {
        Ok(Models {
            address: self.address,
            line_item: self.line_item,
            order_request: self.order_request,
            order: self.order,
        })
    }
}
