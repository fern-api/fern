# frozen_string_literal: true

module Seed
  module Health
    module Service
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Health::Service::Client]
        def initialize(client:)
          @client = client
        end

        # This endpoint checks the health of a resource.
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        # @option params [String] :id
        #
        # @return [untyped]
        def check(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/check/#{params[:id]}"
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

        # This endpoint checks the health of the service.
        #
        # @param request_options [Seed::RequestOptions]
        # @param params [Hash[untyped, untyped]]
        #
        # @return [bool]
        def ping(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/ping"
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
