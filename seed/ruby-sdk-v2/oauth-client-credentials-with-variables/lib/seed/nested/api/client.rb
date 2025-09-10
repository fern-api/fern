# frozen_string_literal: true

module Seed
  module Nested
    module Api
      class Client
        # @return [Seed::Nested::Api::Client]
        def initialize(client:)
          @client = client
        end

        # @return [untyped]
        def get_something(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/nested/get-something"
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end
      end
    end
  end
end
