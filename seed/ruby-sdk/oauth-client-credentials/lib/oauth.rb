# frozen_string_literal: true

require_relative "./fern_oauth_client_credentials/auth/client"

module SeedOauthClientCredentialsClient
  # @!visibility private
  class AccessToken
    # @return [String]
    attr_reader :access_token
    # @return [String]
    attr_reader :refresh_token
    # @return [Time]
    attr_reader :expires_at

    def initialize(access_token:, refresh_token:, expires_at:)
      @access_token = access_token
      @refresh_token = refresh_token
      @expires_at = expires_at
    end
  end

  # Utility class to automatically fetch and refresh an access token
  class OauthTokenProvider
    EXPIRY_BUFFER_MINUTES = 2

    # @param request_client [SeedOauthClientCredentialsClient::RequestClient]
    # @param client_id [String]
    # @param client_secret [String]
    # @return [SeedOauthClientCredentialsClient::OauthTokenProvider]
    def initialize(request_client:, client_id:, client_secret:, scope: nil)
      @client_id = client_id
      @client_secret = client_secret
      @scope = scope

      # @type [SeedOauthClientCredentialsClient::AuthClient]
      @auth_client = SeedOauthClientCredentialsClient::AuthClient.new(request_client: request_client)
    end

    # Returns the access token retrieved from the provided client credentials
    #
    # @return [String]
    def token
      return @token.access_token if !@token.nil? && @token.expires_at <= Time.now

      @token = refresh_token
      @token.access_token
    end

    # Continue generating refresh tokens as the tokens expire
    #
    # @return [AccessToken]
    def refresh_token
      token_response = if @token.nil?
                         @auth_client.get_token_with_client_credentials(
                           client_id: @client_id,
                           client_secret: @client_secret,
                           scope: @scope
                         )
                       else
                         @auth_client.refresh_token(
                           client_id: @client_id,
                           client_secret: @client_secret,
                           refresh_token: @token.refresh_token,
                           scope: @scope
                         )
                       end



      AccessToken.new(
        access_token: token_response.access_token,
        refresh_token: @refresh_token,
        expires_at: Time.now + token_response.expires_in - EXPIRY_BUFFER_MINUTES * 60
      )
    end
  end
end
