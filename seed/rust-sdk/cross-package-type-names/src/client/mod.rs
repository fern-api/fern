pub mod folder_a;
pub mod folder_d;
pub mod foo;

pub struct CrossPackageTypeNamesClient {
    pub folder_a: FolderAClient,
    pub folder_d: FolderDClient,
    pub foo: FooClient,
}

impl CrossPackageTypeNamesClient {
    pub fn new() -> Self {
        Self {
    folder_a: FolderAClient::new("".to_string()),
    folder_d: FolderDClient::new("".to_string()),
    foo: FooClient::new("".to_string())
}
    }

}


pub use folder_a::FolderAClient;
pub use folder_d::FolderDClient;
pub use foo::FooClient;