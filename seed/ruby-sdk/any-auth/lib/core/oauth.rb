# frozen_string_literal: true

require_relative "../requests"
require_relative "../fern_any_auth/auth/client"
require_relative "oauth"

module SeedAnyAuthClient
  class AccessToken
    # @return [String]
    attr_reader :access_token
    # @return [Time]
    attr_reader :expires_at

    # @param access_token [String]
    # @param expires_at [Time]
    # @return [SeedAnyAuthClient::AccessToken]
    def initialize(access_token:, expires_at: nil)
      @access_token = access_token
      @expires_at = expires_at
    end
  end

  # Utility class for managing token refresh.
  class OauthTokenProvider
    # @return [String]
    attr_reader :client_id
    # @return [String]
    attr_reader :client_secret
    # @return [String]
    attr_reader :auth_client

    EXPIRY_BUFFER_MINUTES = 2

    # @param client_id [String]
    # @param client_secret [String]
    # @param request_client [SeedAnyAuthClient::RequestClient]
    # @return [SeedAnyAuthClient::OauthTokenProvider]
    def initialize(client_id:, client_secret:, request_client:)
      @client_id = client_id
      @client_secret = client_secret
      @auth_client = SeedAnyAuthClient::AuthClient.new(request_client: request_client)
    end

    # Returns a cached access token retrieved from the provided client credentials,
    #  refreshing if necessary.
    #
    # @return [String]
    def token
      return @token.access_token if !@token.nil? && (@token.expires_at.nil? || @token.expires_at > Time.now)

      @token = refresh_token
      @token.access_token
    end

    # @return [SeedAnyAuthClient::AccessToken]
    def refresh_token
      token_response = @auth_client.get_token(client_id: @client_id, client_secret: @client_secret)
      SeedAnyAuthClient::AccessToken.new(access_token: token_response.access_token,
                                         expires_at: Time.now + token_response.expires_in - (EXPIRY_BUFFER_MINUTES * 60))
    end
  end
end
