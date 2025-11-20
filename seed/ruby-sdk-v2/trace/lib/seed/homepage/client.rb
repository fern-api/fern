# frozen_string_literal: true

module Seed
  module Homepage
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Homepage::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [Array[String]]
      def get_homepage_problems(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: "/homepage-problems"
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
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def set_homepage_problems(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "POST",
          path: "/homepage-problems",
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
