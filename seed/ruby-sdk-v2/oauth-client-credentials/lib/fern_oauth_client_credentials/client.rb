# frozen_string_literal: true

module FernOauthClientCredentials
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentials::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentials::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentials::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentials::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernOauthClientCredentials::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentials::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentials::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentials::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentials::Simple::Client.new(client: @raw_client)
    end
  end
end
