# frozen_string_literal: true

module Seed
  module V2
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::V2::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def test(request_options: {}, **_params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::PROD,
          method: "GET",
          path: ""
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

      # @return [Seed::Problem::Client]
      def problem
        @problem ||= Seed::V2::Problem::Client.new(client: @client)
      end

      # @return [Seed::V3::Client]
      def v_3
        @v_3 ||= Seed::V2::V3::Client.new(client: @client)
      end
    end
  end
end
