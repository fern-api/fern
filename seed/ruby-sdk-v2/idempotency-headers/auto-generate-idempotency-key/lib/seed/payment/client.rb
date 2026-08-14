# frozen_string_literal: true

module Seed
  module Payment
    class Client
      # @param client [::Seed::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [::Hash]
      # @param params [::Seed::Payment::Types::CreatePaymentRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.payment.create(
      #     amount: 1,
      #     currency: "USD"
      #   )
      #
      # @return [String]
      def create(request_options: {}, **params)
        params = ::Seed::Internal::Types::Utils.normalize_keys(params)
        headers = { "Idempotency-Key" => request_options[:idempotency_key] || ::Seed::Internal::IdempotencyKey.generate }
        request = ::Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/payment",
          headers: headers,
          body: ::Seed::Payment::Types::CreatePaymentRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise ::Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [::Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :payment_id
      #
      # @example
      #   client.payment.delete(payment_id: "paymentId")
      #
      # @return [untyped]
      def delete(request_options: {}, **params)
        params = ::Seed::Internal::Types::Utils.normalize_keys(params)
        request = ::Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "DELETE",
          path: "/payment/#{URI.encode_uri_component(params[:payment_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise ::Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = ::Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
