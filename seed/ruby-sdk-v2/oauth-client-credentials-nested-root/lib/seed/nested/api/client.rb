# frozen_string_literal: true

module Seed
  module Nested
    module Api
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash[untyped, untyped]]
        # @param params [Hash[untyped, untyped]]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @return [untyped]
        def get_something(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/nested/get-something"
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
