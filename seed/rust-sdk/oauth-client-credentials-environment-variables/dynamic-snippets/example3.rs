use seed_oauth_client_credentials_environment_variables::{
    ClientConfig, OauthClientCredentialsEnvironmentVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = OauthClientCredentialsEnvironmentVariablesClient::new(config)
        .expect("Failed to build client");
    client.nested_api_get_something().await;
}
