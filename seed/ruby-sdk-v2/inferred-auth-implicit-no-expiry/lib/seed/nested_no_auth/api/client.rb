# frozen_string_literal: true

module Seed
  module NestedNoAuth
    module Api
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::NestedNoAuth::Api::Client]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash[untyped, untyped]]
        #
        # @param params [Hash[untyped, untyped]]
        #
        # @return [untyped]
        def get_something(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/nested-no-auth/get-something"
          )
          begin
            _response = @client.send(_request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = _response.code.to_i
          return if code.between?(200, 299)

          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end
    end
  end
end
