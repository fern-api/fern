# frozen_string_literal: true

module Seed
  module Dummy
    class Client
      # @return [Seed::Dummy::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def generate_stream(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "generate-stream",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # @return [Seed::Dummy::Types::StreamResponse]
      def generate(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "generate",
          body: params
        )
        _response = @client.send(_request)
        raise _response.body unless _response.code >= "200" && _response.code < "300"

        Seed::Dummy::Types::StreamResponse.load(_response.body)
      end
    end
  end
end
