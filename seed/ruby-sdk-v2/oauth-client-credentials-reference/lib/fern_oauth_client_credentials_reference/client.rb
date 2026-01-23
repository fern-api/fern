# frozen_string_literal: true

module FernOauthClientCredentialsReference
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsReference::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-reference/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsReference::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsReference::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsReference::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsReference::Simple::Client.new(client: @raw_client)
    end
  end
end
