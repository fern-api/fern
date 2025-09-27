use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    client.nested_no_auth_api_get_something().await;
}
