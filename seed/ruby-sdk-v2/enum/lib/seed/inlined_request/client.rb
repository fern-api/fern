# frozen_string_literal: true

module Seed
  module InlinedRequest
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::InlinedRequest::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      #
      # @param params [Seed::InlinedRequest::Types::SendEnumInlinedRequest]
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        _body_prop_names = %i[operand maybe_operand operand_or_color maybe_operand_or_color]
        _body_bag = params.slice(*_body_prop_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "inlined",
          body: Seed::InlinedRequest::Types::SendEnumInlinedRequest.new(_body_bag).to_h
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
