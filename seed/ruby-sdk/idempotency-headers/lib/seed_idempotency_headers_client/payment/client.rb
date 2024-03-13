# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/currency"
require "async"

module SeedIdempotencyHeadersClient
  class PaymentClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [PaymentClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param amount [Integer]
    # @param currency [Payment::Currency]
    # @param request_options [IdempotencyRequestOptions]
    # @return [String]
    def create(amount:, currency:, request_options: nil)
      response = @request_client.conn.post("/payment") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["Idempotency-Key"] = request_options.idempotency_key unless request_options&.idempotency_key.nil?
        unless request_options&.idempotency_expiration.nil?
          req.headers["Idempotency-Expiration"] = request_options.idempotency_expiration
        end
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), amount: amount, currency: currency }.compact
      end
      response.body
    end

    # @param payment_id [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def delete(payment_id:, request_options: nil)
      @request_client.conn.delete("/payment/#{payment_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
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
    # @param currency [Payment::Currency]
    # @param request_options [IdempotencyRequestOptions]
    # @return [String]
    def create(amount:, currency:, request_options: nil)
      Async do
        response = @request_client.conn.post("/payment") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["Idempotency-Key"] = request_options.idempotency_key unless request_options&.idempotency_key.nil?
          unless request_options&.idempotency_expiration.nil?
            req.headers["Idempotency-Expiration"] = request_options.idempotency_expiration
          end
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            amount: amount,
            currency: currency
          }.compact
        end
        response.body
      end
    end

    # @param payment_id [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def delete(payment_id:, request_options: nil)
      Async do
        @request_client.conn.delete("/payment/#{payment_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
      end
    end
  end
end
