# frozen_string_literal: true

module FernOauthClientCredentialsWithVariables
  class Client
    # @param base_url [String, nil]
    #
    # @return [void]
    def initialize(base_url: nil)
      @raw_client = FernOauthClientCredentialsWithVariables::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
          "User-Agent" => "fern_oauth-client-credentials-with-variables/0.0.1",
          "X-Fern-Language" => "Ruby"
        }
      )
    end

    # @return [FernOauthClientCredentialsWithVariables::Auth::Client]
    def auth
      @auth ||= FernOauthClientCredentialsWithVariables::Auth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsWithVariables::NestedNoAuth::Client]
    def nested_no_auth
      @nested_no_auth ||= FernOauthClientCredentialsWithVariables::NestedNoAuth::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsWithVariables::Nested::Client]
    def nested
      @nested ||= FernOauthClientCredentialsWithVariables::Nested::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsWithVariables::Service::Client]
    def service
      @service ||= FernOauthClientCredentialsWithVariables::Service::Client.new(client: @raw_client)
    end

    # @return [FernOauthClientCredentialsWithVariables::Simple::Client]
    def simple
      @simple ||= FernOauthClientCredentialsWithVariables::Simple::Client.new(client: @raw_client)
    end
  end
end
