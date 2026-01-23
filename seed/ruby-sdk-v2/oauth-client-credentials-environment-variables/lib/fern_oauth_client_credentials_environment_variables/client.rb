# frozen_string_literal: true

module FernOauthClientCredentialsEnvironmentVariables
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsEnvironmentVariables::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-environment-variables/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsEnvironmentVariables::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsEnvironmentVariables::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsEnvironmentVariables::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernOauthClientCredentialsEnvironmentVariables::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsEnvironmentVariables::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentialsEnvironmentVariables::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsEnvironmentVariables::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsEnvironmentVariables::Simple::Client.new(client: @raw_client)
    end
  end
end
