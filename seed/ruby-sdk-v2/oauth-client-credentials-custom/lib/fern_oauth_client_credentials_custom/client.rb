# frozen_string_literal: true

module FernOauthClientCredentialsCustom
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsCustom::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-custom/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsCustom::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsCustom::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsCustom::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernOauthClientCredentialsCustom::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsCustom::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentialsCustom::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsCustom::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsCustom::Simple::Client.new(client: @raw_client)
    end
  end
end
