# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @return [Seed::Service::Types::Foo]
      def get(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/ruby-reserved-word-properties/getFoo"
        )
        _response = @client.send(_request)
        return Seed::Service::Types::Foo.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
