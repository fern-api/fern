# frozen_string_literal: true

module Seed
  module Folder
    module Service
      class Client
        # @param client [Seed::Internal::Http::RawClient]
        #
        # @return [Seed::Folder::Service::Client]
        def initialize(client:)
          @client = client
        end

        # @param request_options [Seed::RequestOptions]
        #
        # @param params [Hash[untyped, untyped]]
        #
        # @return [untyped]
        def endpoint(request_options: {}, **_params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/service"
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

        # @param request_options [Seed::RequestOptions]
        #
        # @param params [Hash[untyped, untyped]]
        #
        # @return [untyped]
        def unknown_request(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "POST",
            path: "/service",
            body: params
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
