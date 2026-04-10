pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WithjsonpropertyRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::base64_bytes::option")]
    pub file: Option<Vec<u8>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub json: Option<MyObject>,
}
impl WithjsonpropertyRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        if let Some(ref file_data) = self.file {
            form = form.part(
                "file",
                reqwest::multipart::Part::bytes(file_data.clone())
                    .file_name("file")
                    .mime_str("application/octet-stream")
                    .unwrap(),
            );
        }

        if let Some(ref value) = self.json {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("json", json_str);
            }
        }

        form
    }
}

impl WithjsonpropertyRequest {
    pub fn builder() -> WithjsonpropertyRequestBuilder {
        <WithjsonpropertyRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithjsonpropertyRequestBuilder {
    file: Option<Vec<u8>>,
    json: Option<MyObject>,
}

impl WithjsonpropertyRequestBuilder {
    pub fn file(mut self, value: Vec<u8>) -> Self {
        self.file = Some(value);
        self
    }

    pub fn json(mut self, value: MyObject) -> Self {
        self.json = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithjsonpropertyRequest`].
    pub fn build(self) -> Result<WithjsonpropertyRequest, BuildError> {
        Ok(WithjsonpropertyRequest {
            file: self.file,
            json: self.json,
        })
    }
}
