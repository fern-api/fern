# frozen_string_literal: true

module Seed
  module Internal
    class InferredAuthProvider
      BUFFER_IN_MINUTES = 2

      # @param auth_client [untyped]
      # @param options [Hash[String, untyped]]
      #
      # @return [void]
      def initialize(auth_client:, options:)
        @auth_client = auth_client
        @options = options
        @access_token = nil
      end

      # Returns a cached access token, refreshing if necessary.
      #
      # @return [String]
      def get_token
        return @access_token if @access_token

        refresh
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
    end
  end
end
