# frozen_string_literal: true

module Seed
  module Calls
    module Calls
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [void]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Hash]
        # @param _params [Hash]
        # @option request_options [String] :base_url
        # @option request_options [Hash{String => Object}] :additional_headers
        # @option request_options [Hash{String => Object}] :additional_query_parameters
        # @option request_options [Hash{String => Object}] :additional_body_parameters
        # @option request_options [Integer] :timeout_in_seconds
        #
        # @example
        #   client.calls.calls.create_call
        #
        # @return [Seed::Calls::Types::Call]
        def create_call(request_options: {}, **_params)
          request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "calls",
            request_options: request_options
          )
          begin
            response = @client.send(request)
          rescue Net::HTTPRequestTimeout
            raise Seed::Errors::TimeoutError
          end
          code = response.code.to_i
          if code.between?(200, 299)
            (response.body.to_s.empty? ? nil : Seed::Calls::Types::Call.load(response.body))
          else
            error_class = Seed::Errors::ResponseError.subclass_for_code(code)
            error_types = {
              403 => Seed::Types::ServiceErrorResponse,
              409 => Seed::Types::ServiceErrorResponse,
              422 => Seed::Types::ServiceErrorResponse,
              500 => Seed::Types::ServiceErrorResponse
            }
            error_body = Seed::Errors::ResponseError.load_error_body(code, response.body, error_types)
            raise error_class.new(response.body, code: code, body: error_body)
          end
        end
      end
    end
  end
end
