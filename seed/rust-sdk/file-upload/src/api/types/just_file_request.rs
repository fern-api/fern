pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct JustFileRequest {
    pub file: Vec<u8>,
}
impl JustFileRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        form = form.part(
            "file",
            reqwest::multipart::Part::bytes(self.file.clone())
                .file_name("file")
                .mime_str("application/octet-stream")
                .unwrap(),
        );

        form
    }
}
