# frozen_string_literal: true

module FernOauthClientCredentialsMandatoryAuth
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsMandatoryAuth::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-mandatory-auth/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsMandatoryAuth::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsMandatoryAuth::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsMandatoryAuth::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentialsMandatoryAuth::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsMandatoryAuth::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsMandatoryAuth::Simple::Client.new(client: @raw_client)
    end
  end
end
