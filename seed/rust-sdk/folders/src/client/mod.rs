pub mod a;
pub mod folder;

pub struct ApiClient {
    pub a: AClient,
    pub folder: FolderClient,
}

impl ApiClient {
    pub fn new() -> Self {
        Self {
    a: AClient::new("".to_string()),
    folder: FolderClient::new("".to_string())
}
    }

}


pub use a::AClient;
pub use folder::FolderClient;