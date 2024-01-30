# frozen_string_literal: true

require "async"

module SeedIdempotencyHeadersClient
  module Payment
    class PaymentClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [PaymentClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param amount [Integer]
      # @param currency [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [UUID]
      def create(amount:, currency:, request_options: nil)
        @request_client.conn.post("/payment") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.body = { amount: "amount", currency: "currency" }.compact
        end
      end

      # @param payment_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def delete(payment_id:, request_options: nil)
        @request_client.conn.delete("/payment/#{payment_id}") do |req|
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
        end
      end
    end

    class AsyncPaymentClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncPaymentClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param amount [Integer]
      # @param currency [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [UUID]
      def create(amount:, currency:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/payment") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.body = { amount: "amount", currency: "currency" }.compact
          end
          response
        end
      end

      # @param payment_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def delete(payment_id:, request_options: nil)
        Async.call do
          @request_client.conn.delete("/payment/#{payment_id}") do |req|
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          end
        end
      end
    end
  end
end
