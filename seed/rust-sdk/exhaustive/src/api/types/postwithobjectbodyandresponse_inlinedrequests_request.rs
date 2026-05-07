pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PostwithobjectbodyandresponseInlinedrequestsRequest {
    #[serde(default)]
    pub string: String,
    #[serde(default)]
    pub integer: i64,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: TypesObjectWithOptionalField,
}

impl PostwithobjectbodyandresponseInlinedrequestsRequest {
    pub fn builder() -> PostwithobjectbodyandresponseInlinedrequestsRequestBuilder {
        <PostwithobjectbodyandresponseInlinedrequestsRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PostwithobjectbodyandresponseInlinedrequestsRequestBuilder {
    string: Option<String>,
    integer: Option<i64>,
    nested_object: Option<TypesObjectWithOptionalField>,
}

impl PostwithobjectbodyandresponseInlinedrequestsRequestBuilder {
    pub fn string(mut self, value: impl Into<String>) -> Self {
        self.string = Some(value.into());
        self
    }

    pub fn integer(mut self, value: i64) -> Self {
        self.integer = Some(value);
        self
    }

    pub fn nested_object(mut self, value: TypesObjectWithOptionalField) -> Self {
        self.nested_object = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PostwithobjectbodyandresponseInlinedrequestsRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`string`](PostwithobjectbodyandresponseInlinedrequestsRequestBuilder::string)
    /// - [`integer`](PostwithobjectbodyandresponseInlinedrequestsRequestBuilder::integer)
    /// - [`nested_object`](PostwithobjectbodyandresponseInlinedrequestsRequestBuilder::nested_object)
    pub fn build(self) -> Result<PostwithobjectbodyandresponseInlinedrequestsRequest, BuildError> {
        Ok(PostwithobjectbodyandresponseInlinedrequestsRequest {
            string: self
                .string
                .ok_or_else(|| BuildError::missing_field("string"))?,
            integer: self
                .integer
                .ok_or_else(|| BuildError::missing_field("integer"))?,
            nested_object: self
                .nested_object
                .ok_or_else(|| BuildError::missing_field("nested_object"))?,
        })
    }
}
