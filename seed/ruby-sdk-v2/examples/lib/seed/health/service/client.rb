# frozen_string_literal: true

module Seed
  module Health
    module Service
      class Client
        # @return [Seed::Health::Service::Client]
        def initialize(client:)
          @client = client
        end

        # This endpoint checks the health of a resource.
        #
        # @return [untyped]
        def check(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/check/#{params[:id]}"
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # This endpoint checks the health of the service.
        #
        # @return [bool]
        def ping(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/ping"
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end
      end
    end
  end
end
