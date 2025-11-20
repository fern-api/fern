# frozen_string_literal: true

module Seed
  module CustomAuth
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::CustomAuth::Client]
      def initialize(client:)
        @client = client
      end

      # GET request with custom auth scheme
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [bool]
      def get_with_custom_auth(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "custom-auth"
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

      # POST request with custom auth scheme
      #
      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [bool]
      def post_with_custom_auth(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "custom-auth",
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
