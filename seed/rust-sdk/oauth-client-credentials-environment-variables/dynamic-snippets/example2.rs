use seed_oauth_client_credentials_environment_variables::{
    ClientConfig, OauthClientCredentialsEnvironmentVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthClientCredentialsEnvironmentVariablesClient::new(config)
        .expect("Failed to build client");
    client.nested_no_auth.api.get_something(None).await;
}
