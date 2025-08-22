# frozen_string_literal: true

module Seed
  module Auth
    class Client
      # @return [Seed::Auth::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Auth::Types::TokenResponse]
      def get_token_with_client_credentials(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/token",
          body: params
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Auth::Types::TokenResponse.load(_response.body)
        end

        raise _response.body
      end

      # @return [Seed::Auth::Types::TokenResponse]
      def refresh_token(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/token",
          body: params
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Auth::Types::TokenResponse.load(_response.body)
        end

        raise _response.body
      end
    end
  end
end
