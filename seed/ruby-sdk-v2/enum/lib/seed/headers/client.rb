# frozen_string_literal: true

module Seed
  module Headers
    class Client
      # @return [Seed::Headers::Client]
      def initialize(client:)
        @client = client
      end

      # @return [untyped]
      def send(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "headers"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
