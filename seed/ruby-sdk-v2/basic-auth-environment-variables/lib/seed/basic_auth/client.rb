# frozen_string_literal: true

module Seed
  module BasicAuth
    class Client
      # @return [Seed::BasicAuth::Client]
      def initialize(client:)
        @client = client
      end

      # GET request with basic auth scheme
      #
      # @return [bool]
      def get_with_basic_auth(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "basic-auth"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # POST request with basic auth scheme
      #
      # @return [bool]
      def post_with_basic_auth(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "basic-auth",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
