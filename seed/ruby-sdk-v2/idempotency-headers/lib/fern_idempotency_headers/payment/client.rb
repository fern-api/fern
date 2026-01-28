# frozen_string_literal: true

module FernIdempotencyHeaders
  module Payment
    class Client
      # @param client [FernIdempotencyHeaders::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernIdempotencyHeaders::Payment::Types::CreatePaymentRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def create(request_options: {}, **params)
        params = FernIdempotencyHeaders::Internal::Types::Utils.normalize_keys(params)
        request = FernIdempotencyHeaders::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/payment",
          body: FernIdempotencyHeaders::Payment::Types::CreatePaymentRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernIdempotencyHeaders::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernIdempotencyHeaders::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :payment_id
      #
      # @return [untyped]
      def delete(request_options: {}, **params)
        params = FernIdempotencyHeaders::Internal::Types::Utils.normalize_keys(params)
        request = FernIdempotencyHeaders::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/payment/#{params[:payment_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernIdempotencyHeaders::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernIdempotencyHeaders::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
