use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    client.simple_get_something().await;
}
