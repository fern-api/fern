# frozen_string_literal: true

module Seed
  module NoAuth
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::NoAuth::Client]
      def initialize(client:)
        @client = client
      end

      # POST request with no auth
      #
      # @param request_options [Hash[untyped, untyped]]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [bool]
      def post_with_no_auth(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/no-auth",
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
