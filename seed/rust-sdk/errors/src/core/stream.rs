use reqwest::Response;

/// Simple function to download a file as bytes
pub async fn download_file(response: Response) -> Result<Vec<u8>, reqwest::Error> {
    response.bytes().await.map(|b| b.to_vec())
}