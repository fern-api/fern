use crate::{FormFile, MultipartFormField};

/// Builder for multipart/form-data request bodies.
///
/// This struct handles the construction of properly formatted multipart/form-data
/// bodies according to RFC 2388, including boundary generation and CRLF line endings.
///
/// # Example
/// ```
/// use your_crate::{MultipartFormData, FormFile};
///
/// let mut multipart = MultipartFormData::new();
/// multipart.add_field("description", "My file");
/// multipart.add_file("file", FormFile::new(vec![1, 2, 3]));
///
/// let bytes = multipart.to_bytes();
/// let content_type = format!("multipart/form-data; boundary={}", multipart.boundary());
/// ```
#[derive(Debug, Clone)]
pub struct MultipartFormData {
    boundary: String,
    fields: Vec<MultipartFormField>,
}

impl MultipartFormData {
    /// Creates a new MultipartFormData with a randomly generated boundary
    pub fn new() -> Self {
        // Generate a simple random boundary using timestamp
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let boundary = format!("fern-boundary-{}", timestamp);
        Self {
            boundary,
            fields: Vec::new(),
        }
    }

    /// Creates a new MultipartFormData with a custom boundary
    pub fn with_boundary(boundary: impl Into<String>) -> Self {
        Self {
            boundary: boundary.into(),
            fields: Vec::new(),
        }
    }

    /// Returns the boundary string used by this multipart data
    pub fn boundary(&self) -> &str {
        &self.boundary
    }

    /// Adds a text field to the multipart data
    pub fn add_field(&mut self, name: impl Into<String>, value: impl Into<String>) {
        self.fields
            .push(MultipartFormField::field(name.into(), value.into()));
    }

    /// Adds a file field to the multipart data
    pub fn add_file(&mut self, name: impl Into<String>, file: FormFile) {
        self.fields.push(MultipartFormField::file(name.into(), file));
    }

    /// Adds multiple files under the same field name
    pub fn add_file_array(&mut self, name: impl Into<String>, files: Vec<FormFile>) {
        self.fields
            .push(MultipartFormField::file_array(name.into(), files));
    }

    /// Adds a pre-constructed MultipartFormField
    pub fn add_form_field(&mut self, field: MultipartFormField) {
        self.fields.push(field);
    }

    /// Returns all fields in this multipart data
    pub fn fields(&self) -> &[MultipartFormField] {
        &self.fields
    }

    /// Serializes the multipart data to bytes following RFC 2388
    ///
    /// The format follows this structure:
    /// ```text
    /// --boundary\r\n
    /// Content-Disposition: form-data; name="field_name"\r\n
    /// \r\n
    /// field_value\r\n
    /// --boundary\r\n
    /// Content-Disposition: form-data; name="file"; filename="example.txt"\r\n
    /// Content-Type: text/plain\r\n
    /// \r\n
    /// [file data]\r\n
    /// --boundary--\r\n
    /// ```
    pub fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();

        for field in &self.fields {
            match field {
                MultipartFormField::Field { name, value } => {
                    self.write_field_part(&mut bytes, name, value);
                }
                MultipartFormField::File { name, file } => {
                    self.write_file_part(&mut bytes, name, file);
                }
                MultipartFormField::FileArray { name, files } => {
                    for file in files {
                        self.write_file_part(&mut bytes, name, file);
                    }
                }
            }
        }

        // Write closing boundary: --boundary--\r\n
        bytes.extend_from_slice(b"--");
        bytes.extend_from_slice(self.boundary.as_bytes());
        bytes.extend_from_slice(b"--\r\n");

        bytes
    }

    /// Writes a boundary line: --boundary\r\n
    fn write_boundary(&self, bytes: &mut Vec<u8>) {
        bytes.extend_from_slice(b"--");
        bytes.extend_from_slice(self.boundary.as_bytes());
        bytes.extend_from_slice(b"\r\n");
    }

    /// Writes a text field part
    fn write_field_part(&self, bytes: &mut Vec<u8>, name: &str, value: &str) {
        self.write_boundary(bytes);

        // Content-Disposition header
        bytes.extend_from_slice(b"Content-Disposition: form-data; name=\"");
        bytes.extend_from_slice(name.as_bytes());
        bytes.extend_from_slice(b"\"\r\n\r\n");

        // Field value
        bytes.extend_from_slice(value.as_bytes());
        bytes.extend_from_slice(b"\r\n");
    }

    /// Writes a file part
    fn write_file_part(&self, bytes: &mut Vec<u8>, name: &str, file: &FormFile) {
        self.write_boundary(bytes);

        // Content-Disposition header with filename
        bytes.extend_from_slice(b"Content-Disposition: form-data; name=\"");
        bytes.extend_from_slice(name.as_bytes());
        bytes.extend_from_slice(b"\"");

        if let Some(ref filename) = file.filename {
            bytes.extend_from_slice(b"; filename=\"");
            bytes.extend_from_slice(filename.as_bytes());
            bytes.extend_from_slice(b"\"");
        }
        bytes.extend_from_slice(b"\r\n");

        // Content-Type header
        if let Some(ref content_type) = file.content_type {
            bytes.extend_from_slice(b"Content-Type: ");
            bytes.extend_from_slice(content_type.as_bytes());
            bytes.extend_from_slice(b"\r\n");
        }

        // Empty line before data
        bytes.extend_from_slice(b"\r\n");

        // File data
        bytes.extend_from_slice(&file.data);
        bytes.extend_from_slice(b"\r\n");
    }

    /// Returns the Content-Type header value for this multipart data
    pub fn content_type(&self) -> String {
        format!("multipart/form-data; boundary={}", self.boundary)
    }
}

impl Default for MultipartFormData {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multipart_with_text_fields() {
        let mut multipart = MultipartFormData::with_boundary("test-boundary");
        multipart.add_field("field1", "value1");
        multipart.add_field("field2", "value2");

        let bytes = multipart.to_bytes();
        let result = String::from_utf8_lossy(&bytes);

        assert!(result.contains("--test-boundary\r\n"));
        assert!(result.contains("Content-Disposition: form-data; name=\"field1\"\r\n\r\nvalue1\r\n"));
        assert!(result.contains("Content-Disposition: form-data; name=\"field2\"\r\n\r\nvalue2\r\n"));
        assert!(result.ends_with("--test-boundary--\r\n"));
    }

    #[test]
    fn test_multipart_with_file() {
        let mut multipart = MultipartFormData::with_boundary("test-boundary");
        let file = FormFile {
            data: b"file content".to_vec(),
            filename: Some("test.txt".to_string()),
            content_type: Some("text/plain".to_string()),
        };
        multipart.add_file("upload", file);

        let bytes = multipart.to_bytes();
        let result = String::from_utf8_lossy(&bytes);

        assert!(result.contains("Content-Disposition: form-data; name=\"upload\"; filename=\"test.txt\"\r\n"));
        assert!(result.contains("Content-Type: text/plain\r\n"));
        assert!(result.contains("file content"));
    }

    #[test]
    fn test_content_type() {
        let multipart = MultipartFormData::with_boundary("my-boundary");
        assert_eq!(
            multipart.content_type(),
            "multipart/form-data; boundary=my-boundary"
        );
    }
}
