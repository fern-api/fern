# frozen_string_literal: true

require "faraday"
require_relative "seed_idempotency_headers_client/payment/client"
require "async/http/faraday"

module SeedIdempotencyHeadersClient
  class Client
    attr_reader :payment_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [Client]
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      request_client = RequestClient.new(max_retries: max_retries, timeout_in_seconds: timeout_in_seconds, token: token)
      @payment_client = Payment::PaymentClient.new(request_client: request_client)
    end
  end

  class AsyncClient
    attr_reader :async_payment_client

    # @param max_retries [Long] The number of times to retry a failed request, defaults to 2.
    # @param timeout_in_seconds [Long]
    # @param token [String]
    # @return [AsyncClient]
    def initialize(max_retries: nil, timeout_in_seconds: nil, token: nil)
      AsyncRequestClient.new(headers: headers, base_url: base_url, conn: conn)
      @async_payment_client = Payment::AsyncPaymentClient.new(request_client: request_client)
    end
  end
end
