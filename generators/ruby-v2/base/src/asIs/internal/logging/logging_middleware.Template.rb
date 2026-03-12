# frozen_string_literal: true

require "set"

module <%= gem_namespace %>
  module Internal
    module Logging
      # HTTP middleware that logs requests and responses.
      #
      # Logs request method, URL, and headers (with sensitive values redacted) at debug level.
      # Logs response status at debug level, and 4xx/5xx responses at error level.
      # Does nothing if the logger is silent.
      # @api private
      class LoggingMiddleware
        SENSITIVE_HEADERS = Set.new(%w[
          authorization
          www-authenticate
          x-api-key
          api-key
          apikey
          x-api-token
          x-auth-token
          auth-token
          proxy-authenticate
          proxy-authorization
          cookie
          set-cookie
          x-csrf-token
          x-xsrf-token
          x-session-token
          x-access-token
        ]).freeze

        # @param logger [Logger] the SDK logger instance
        def initialize(logger)
          @logger = logger
        end

        # Logs details of an outgoing HTTP request.
        # @param method [String] the HTTP method
        # @param url [URI, String] the request URL
        # @param headers [Hash] the request headers
        # @param has_body [Boolean] whether the request has a body
        def log_request(method:, url:, headers: {}, has_body: false)
          return unless @logger.debug?

          redacted = redact_headers(headers)
          @logger.debug(
            "HTTP Request: #{method} #{url} headers=#{redacted} has_body=#{has_body}"
          )
        end

        # Logs details of an HTTP response.
        # @param status [Integer] the HTTP status code
        # @param url [URI, String] the request URL
        # @param headers [Hash] the response headers
        def log_response(status:, url:, headers: {})
          if @logger.debug?
            redacted = redact_headers(headers)
            @logger.debug(
              "HTTP Response: status=#{status} url=#{url} headers=#{redacted}"
            )
          end

          if status >= 400 && @logger.error?
            @logger.error("HTTP Error: status=#{status} url=#{url}")
          end
        end

        private

        def redact_headers(headers)
          headers.each_with_object({}) do |(key, value), result|
            result[key] = SENSITIVE_HEADERS.include?(key.to_s.downcase) ? "[REDACTED]" : value
          end
        end
      end
    end
  end
end
