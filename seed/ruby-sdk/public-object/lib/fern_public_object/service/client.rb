# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedPublicObjectClient
  class ServiceClient
    # @return [SeedPublicObjectClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedPublicObjectClient::RequestClient]
    # @return [SeedPublicObjectClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedPublicObjectClient::RequestOptions]
    # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which
    #  will receive tuples of strings, the sum of characters received so far, and the
    #  response environment. The latter will allow access to the response status,
    #  headers and reason, as well as the request info.
    # @return [Void]
    def get(request_options: nil, &on_data)
      @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.options.on_data = on_data
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/helloworld.txt"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedPublicObjectClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedPublicObjectClient::AsyncRequestClient]
    # @return [SeedPublicObjectClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedPublicObjectClient::RequestOptions]
    # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which
    #  will receive tuples of strings, the sum of characters received so far, and the
    #  response environment. The latter will allow access to the response status,
    #  headers and reason, as well as the request info.
    # @return [Void]
    def get(request_options: nil, &on_data)
      Async do
        @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.options.on_data = on_data
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/helloworld.txt"
        end
      end
    end
  end
end
