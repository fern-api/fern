# frozen_string_literal: true

require "async"

module SeedIdempotencyHeadersClient
  module Payment
    class PaymentClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Payment::PaymentClient]
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
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request_options&.additional_body_parameters, amount: amount, currency: currency }.compact
        end
      end

      # @param payment_id [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def delete(payment_id:, request_options: nil)
        @request_client.conn.delete("/payment/#{payment_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end
    end

    class AsyncPaymentClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Payment::AsyncPaymentClient]
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
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request_options&.additional_body_parameters, amount: amount, currency: currency }.compact
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
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end
    end
  end
end
