# frozen_string_literal: true

module Seed
  module Endpoints
    module Union
      class Client
        # @return [Seed::Endpoints::Union::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Seed::Types::Union::Types::Animal]
        def get_and_return_union(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/union",
            body: Seed::Types::Union::Types::Animal.new(params).to_h
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Union::Types::Animal.load(_response.body)
          end

          raise _response.body
        end
      end
    end
  end
end
