# frozen_string_literal: true

module FernOauthClientCredentialsDefault
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsDefault::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-default/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsDefault::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsDefault::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsDefault::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernOauthClientCredentialsDefault::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsDefault::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentialsDefault::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsDefault::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsDefault::Simple::Client.new(client: @raw_client)
    end
  end
end
