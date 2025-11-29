# frozen_string_literal: true

module Seed
  module Internal
    class InferredAuthProvider
      BUFFER_IN_SECONDS = 120 # 2 minutes

      # @param auth_client [untyped]
      # @param options [Hash[String, untyped]]
      #
      # @return [void]
      def initialize(auth_client:, options:)
        @auth_client = auth_client
        @options = options
        @access_token = nil
        @expires_at = nil
      end

      # Returns a cached access token, refreshing if necessary.
      # Refreshes the token if it's nil, or if we're within the buffer period before expiration.
      #
      # @return [String]
      def get_token
        return refresh if @access_token.nil? || token_needs_refresh?

        @access_token
      end

      # Returns the authentication headers to be included in requests.
      #
      # @return [Hash[String, String]]
      def get_auth_headers
        token = get_token
        {
          "Authorization" => "Bearer #{token}"
        }
      end
      # Checks if the token needs to be refreshed.
      # Returns true if the token will expire within the buffer period.
      #
      # @return [Boolean]
      private def token_needs_refresh?
        return true if @expires_at.nil?

        Time.now >= (@expires_at - BUFFER_IN_SECONDS)
      end
      # Refreshes the access token by calling the token endpoint.
      #
      # @return [String]
      private def refresh
        request_params = {
          x_api_key: @options[:x_api_key],
          client_id: @options[:client_id],
          client_secret: @options[:client_secret],
          audience: "https://api.example.com",
          grant_type: "client_credentials",
          scope: @options[:scope]
        }

        token_response = @auth_client.get_token_with_client_credentials(**request_params)

        @access_token = token_response.access_token
        @expires_at = Time.now + token_response.expires_in

        @access_token
      end
    end
  end
end
