# frozen_string_literal: true

module Seed
  module PathParam
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::PathParam::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "path/#{params[:operand]}/#{params[:operand_or_color]}"
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
