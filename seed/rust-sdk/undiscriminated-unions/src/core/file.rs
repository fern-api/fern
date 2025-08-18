use std::path::Path;

/// A file type suitable for file uploads with optional metadata.
#[derive(Debug, Clone)]
pub struct File {
    /// The raw file data as bytes
    pub data: Vec<u8>,
    /// Optional filename for the file
    pub filename: Option<String>,
    /// Optional content type (MIME type) for the file
    pub content_type: Option<String>,
}

impl File {
    /// Create a new File with just data
    pub fn new(data: Vec<u8>) -> Self {
        Self {
            data,
            filename: None,
            content_type: None,
        }
    }

    /// Set the filename for this file
    pub fn with_filename<S: Into<String>>(mut self, filename: S) -> Self {
        self.filename = Some(filename.into());
        self
    }

    /// Set the content type for this file
    pub fn with_content_type<S: Into<String>>(mut self, content_type: S) -> Self {
        self.content_type = Some(content_type.into());
        self
    }

    /// Create a File from a filesystem path
    pub fn from_path<P: AsRef<Path>>(path: P) -> std::io::Result<Self> {
        let path = path.as_ref();
        let data = std::fs::read(path)?;
        let filename = path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|s| s.to_string());

        let mut file = Self {
            data,
            filename,
            content_type: None,
        };

        // Auto-detect content type if filename is available
        file.detect_content_type();
        Ok(file)
    }

    /// Auto-detect content type based on filename or file content
    pub fn detect_content_type(&mut self) {
        if self.content_type.is_none() {
            if let Some(filename) = &self.filename {
                self.content_type = Some(Self::detect_mime_from_filename(filename));
            } else {
                self.content_type = Some(self.detect_mime_from_content());
            }
        }
    }

    /// Detect MIME type from filename extension
    fn detect_mime_from_filename(filename: &str) -> String {
        let extension = std::path::Path::new(filename)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");

        match extension.to_lowercase().as_str() {
            "jpg" | "jpeg" => "image/jpeg",
            "png" => "image/png",
            "gif" => "image/gif",
            "webp" => "image/webp",
            "svg" => "image/svg+xml",
            "pdf" => "application/pdf",
            "txt" => "text/plain",
            "html" | "htm" => "text/html",
            "css" => "text/css",
            "js" => "application/javascript",
            "json" => "application/json",
            "xml" => "application/xml",
            "zip" => "application/zip",
            "mp4" => "video/mp4",
            "mp3" => "audio/mpeg",
            "wav" => "audio/wav",
            _ => "application/octet-stream",
        }
        .to_string()
    }

    /// Detect MIME type from file content (magic bytes)
    fn detect_mime_from_content(&self) -> String {
        if self.data.is_empty() {
            return "application/octet-stream".to_string();
        }

        // Check magic bytes for common file types
        if self.data.starts_with(b"\xFF\xD8\xFF") {
            "image/jpeg".to_string()
        } else if self.data.starts_with(b"\x89PNG\r\n\x1A\n") {
            "image/png".to_string()
        } else if self.data.starts_with(b"GIF8") {
            "image/gif".to_string()
        } else if self.data.starts_with(b"%PDF") {
            "application/pdf".to_string()
        } else if self.data.starts_with(b"PK\x03\x04") || self.data.starts_with(b"PK\x05\x06") {
            "application/zip".to_string()
        } else if self.data.starts_with(b"\x00\x00\x00\x20ftypmp4") {
            "video/mp4".to_string()
        } else if self.data.starts_with(b"ID3") || self.data.starts_with(b"\xFF\xFB") {
            "audio/mpeg".to_string()
        } else {
            // Try to detect if it's text
            if self.is_likely_text() {
                "text/plain".to_string()
            } else {
                "application/octet-stream".to_string()
            }
        }
    }

    /// Check if the file content is likely to be text
    fn is_likely_text(&self) -> bool {
        // Sample first 1024 bytes to check if it's text
        let sample_size = std::cmp::min(1024, self.data.len());
        let sample = &self.data[..sample_size];

        // Count printable ASCII characters
        let printable_chars = sample
            .iter()
            .filter(|&&b| (b >= 32 && b <= 126) || b == b'\t' || b == b'\n' || b == b'\r')
            .count();

        // If more than 95% are printable, consider it text
        printable_chars as f64 / sample_size as f64 > 0.95
    }

    /// Get the size of the file in bytes
    pub fn size(&self) -> usize {
        self.data.len()
    }

    /// Check if the file is empty
    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
}

impl From<Vec<u8>> for File {
    fn from(data: Vec<u8>) -> Self {
        Self::new(data)
    }
}

impl From<&[u8]> for File {
    fn from(data: &[u8]) -> Self {
        Self::new(data.to_vec())
    }
}

impl AsRef<[u8]> for File {
    fn as_ref(&self) -> &[u8] {
        &self.data
    }
}