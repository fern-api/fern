# frozen_string_literal: true

module Seed
  module Headers
    class Client
      # @return [Seed::Headers::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Types::SendResponse]
      def send(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "headers",
          body: params
        )
        _response = @client.send(_request)
        return Seed::Types::SendResponse.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
