# frozen_string_literal: true

module FernLiteral
  module Reference
    class Client
      # @param client [FernLiteral::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernLiteral::Reference::Types::SendRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernLiteral::Types::SendResponse]
      def send_(request_options: {}, **params)
        params = FernLiteral::Internal::Types::Utils.normalize_keys(params)
        request = FernLiteral::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "reference",
          body: FernLiteral::Reference::Types::SendRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernLiteral::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernLiteral::Types::SendResponse.load(response.body)
        else
          error_class = FernLiteral::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end
    end
  end
end
