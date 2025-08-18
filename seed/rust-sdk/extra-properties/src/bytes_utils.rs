use std::fs::File;
use std::io::{Read, Result as IoResult};
use crate::ClientError;

/// Trait for types that can be converted to bytes for HTTP requests
pub trait IntoBytes {
    /// Convert the input into a Vec<u8> for use in HTTP request bodies
    fn into_bytes(self) -> Result<Vec<u8>, ClientError>;
}

impl IntoBytes for Vec<u8> {
    fn into_bytes(self) -> Result<Vec<u8>, ClientError> {
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if self.len() > MAX_SIZE {
            return Err(ClientError::FileTooLarge(self.len() as u64));
        }
        Ok(self)
    }
}

impl IntoBytes for File {
    fn into_bytes(mut self) -> Result<Vec<u8>, ClientError> {
        let mut buffer = Vec::new();
        self.read_to_end(&mut buffer)
            .map_err(ClientError::FileUploadError)?;
        
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if buffer.len() > MAX_SIZE {
            return Err(ClientError::FileTooLarge(buffer.len() as u64));
        }
        
        Ok(buffer)
    }
}

impl IntoBytes for Box<dyn Read + Send> {
    fn into_bytes(mut self) -> Result<Vec<u8>, ClientError> {
        let mut buffer = Vec::new();
        self.read_to_end(&mut buffer)
            .map_err(ClientError::FileUploadError)?;
        
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if buffer.len() > MAX_SIZE {
            return Err(ClientError::FileTooLarge(buffer.len() as u64));
        }
        
        Ok(buffer)
    }
}

impl IntoBytes for &[u8] {
    fn into_bytes(self) -> Result<Vec<u8>, ClientError> {
        let bytes = self.to_vec();
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if bytes.len() > MAX_SIZE {
            return Err(ClientError::FileTooLarge(bytes.len() as u64));
        }
        Ok(bytes)
    }
}

impl IntoBytes for &str {
    fn into_bytes(self) -> Result<Vec<u8>, ClientError> {
        let bytes = self.as_bytes().to_vec();
        // Check for reasonable file size limit (100MB)
        const MAX_SIZE: usize = 100 * 1024 * 1024;
        if bytes.len() > MAX_SIZE {
            return Err(ClientError::FileTooLarge(bytes.len() as u64));
        }
        Ok(bytes)
    }
}

/// Prepare bytes body for HTTP request
/// 
/// This function accepts various input types and converts them to Vec<u8>
/// for use in HTTP request bodies. Supported types include:
/// - Vec<u8>: Direct bytes
/// - File: Reads file contents
/// - Box<dyn Read + Send>: Reads from any Read implementation
/// - &[u8], &str: Converts to owned bytes
/// 
/// # Errors
/// - Returns `ClientError::FileUploadError` for I/O errors
/// - Returns `ClientError::FileTooLarge` if file exceeds 100MB limit
/// - Returns `ClientError::InvalidFileData` for invalid data
pub fn prepare_bytes_body<T: IntoBytes>(input: T) -> Result<Vec<u8>, ClientError> {
    let bytes = input.into_bytes()?;
    
    // Validate that we have some content for file uploads
    if bytes.is_empty() {
        return Err(ClientError::InvalidFileData);
    }
    
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;

    #[test]
    fn test_vec_u8_into_bytes() {
        let data = vec![1, 2, 3, 4];
        let result = prepare_bytes_body(data.clone()).unwrap();
        assert_eq!(result, data);
    }

    #[test]
    fn test_slice_into_bytes() {
        let data: &[u8] = &[1, 2, 3, 4];
        let result = prepare_bytes_body(data).unwrap();
        assert_eq!(result, vec![1, 2, 3, 4]);
    }

    #[test]
    fn test_string_slice_into_bytes() {
        let data = "hello world";
        let result = prepare_bytes_body(data).unwrap();
        assert_eq!(result, b"hello world".to_vec());
    }

    #[test]
    fn test_reader_into_bytes() {
        let data = vec![1, 2, 3, 4];
        let cursor = Cursor::new(data.clone());
        let reader: Box<dyn Read + Send> = Box::new(cursor);
        let result = prepare_bytes_body(reader).unwrap();
        assert_eq!(result, data);
    }

    #[test]
    fn test_empty_data_error() {
        let data: &[u8] = &[];
        let result = prepare_bytes_body(data);
        assert!(matches!(result, Err(ClientError::InvalidFileData)));
    }

    #[test]
    fn test_file_too_large_error() {
        // Create data larger than 100MB limit
        let data = vec![0u8; 101 * 1024 * 1024]; // 101MB
        let result = prepare_bytes_body(data);
        assert!(matches!(result, Err(ClientError::FileTooLarge(_))));
    }
}