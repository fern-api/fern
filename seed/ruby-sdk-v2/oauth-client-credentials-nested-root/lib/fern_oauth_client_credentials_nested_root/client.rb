# frozen_string_literal: true

module FernOauthClientCredentialsNestedRoot
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsNestedRoot::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-nested-root/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsNestedRoot::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsNestedRoot::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsNestedRoot::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernOauthClientCredentialsNestedRoot::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsNestedRoot::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentialsNestedRoot::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsNestedRoot::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsNestedRoot::Simple::Client.new(client: @raw_client)
    end
  end
end
