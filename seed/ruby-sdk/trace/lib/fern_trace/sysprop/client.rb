# frozen_string_literal: true

require_relative "../../requests"
require_relative "../commons/types/language"
require "async"

module SeedTraceClient
  class SyspropClient
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::SyspropClient]
    def initialize(request_client:)
      # @type [SeedTraceClient::RequestClient]
      @request_client = request_client
    end

    # @param language [SeedTraceClient::Commons::Language]
    # @param num_warm_instances [Integer]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    def set_num_warm_instances(language:, num_warm_instances:, request_options: nil)
      @request_client.conn.put("/sysprop/num-warm-instances/#{language}/#{num_warm_instances}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/sysprop/num-warm-instances/#{language}/#{num_warm_instances}"
      end
    end

    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Hash{SeedTraceClient::Commons::Language => Integer}]
    def get_num_warm_instances(request_options: nil)
      response = @request_client.conn.get("/sysprop/num-warm-instances") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/sysprop/num-warm-instances"
      end
      response.body
    end
  end

  class AsyncSyspropClient
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncSyspropClient]
    def initialize(request_client:)
      # @type [SeedTraceClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param language [SeedTraceClient::Commons::Language]
    # @param num_warm_instances [Integer]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    def set_num_warm_instances(language:, num_warm_instances:, request_options: nil)
      Async do
        @request_client.conn.put("/sysprop/num-warm-instances/#{language}/#{num_warm_instances}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/sysprop/num-warm-instances/#{language}/#{num_warm_instances}"
        end
      end
    end

    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Hash{SeedTraceClient::Commons::Language => Integer}]
    def get_num_warm_instances(request_options: nil)
      Async do
        response = @request_client.conn.get("/sysprop/num-warm-instances") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/sysprop/num-warm-instances"
        end
        response.body
      end
    end
  end
end
