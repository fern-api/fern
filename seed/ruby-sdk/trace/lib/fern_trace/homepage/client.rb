# frozen_string_literal: true

require_relative "../../requests"
require_relative "../commons/types/problem_id"
require "async"

module SeedTraceClient
  class HomepageClient
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::HomepageClient]
    def initialize(request_client:)
      # @type [SeedTraceClient::RequestClient]
      @request_client = request_client
    end

    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<SeedTraceClient::Commons::PROBLEM_ID>]
    def get_homepage_problems(request_options: nil)
      response = @request_client.conn.get("/homepage-problems") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
      end
      response.body
    end

    # @param request [Array<SeedTraceClient::Commons::PROBLEM_ID>]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    def set_homepage_problems(request:, request_options: nil)
      @request_client.conn.post("/homepage-problems") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
      end
    end
  end

  class AsyncHomepageClient
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncHomepageClient]
    def initialize(request_client:)
      # @type [SeedTraceClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<SeedTraceClient::Commons::PROBLEM_ID>]
    def get_homepage_problems(request_options: nil)
      Async do
        response = @request_client.conn.get("/homepage-problems") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
        end
        response.body
      end
    end

    # @param request [Array<SeedTraceClient::Commons::PROBLEM_ID>]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    def set_homepage_problems(request:, request_options: nil)
      Async do
        @request_client.conn.post("/homepage-problems") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/homepage-problems"
        end
      end
    end
  end
end
