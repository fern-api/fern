# frozen_string_literal: true

module FernEnum
  module InlinedRequest
    class Client
      # @param client [FernEnum::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernEnum::InlinedRequest::Types::SendEnumInlinedRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [untyped]
      def send_(request_options: {}, **params)
        params = FernEnum::Internal::Types::Utils.normalize_keys(params)
        body_prop_names = %i[operand maybe_operand operand_or_color maybe_operand_or_color]
        body_bag = params.slice(*body_prop_names)

        request = FernEnum::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "inlined",
          body: FernEnum::InlinedRequest::Types::SendEnumInlinedRequest.new(body_bag).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernEnum::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernEnum::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
