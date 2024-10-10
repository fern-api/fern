# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedMultiUrlEnvironmentClient
  class Ec2Client
    # @return [SeedMultiUrlEnvironmentClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedMultiUrlEnvironmentClient::RequestClient]
    # @return [SeedMultiUrlEnvironmentClient::Ec2Client]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param size [String]
    # @param request_options [SeedMultiUrlEnvironmentClient::RequestOptions]
    # @return [Void]
    # @example
    #  multi_url_environment = SeedMultiUrlEnvironmentClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedMultiUrlEnvironmentClient::Environment::PRODUCTION,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  multi_url_environment.ec_2.boot_instance(size: "size")
    def boot_instance(size:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}), size: size }.compact
        req.url "#{@request_client.get_url(environment: ec2, request_options: request_options)}/ec2/boot"
      end
    end
  end

  class AsyncEc2Client
    # @return [SeedMultiUrlEnvironmentClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedMultiUrlEnvironmentClient::AsyncRequestClient]
    # @return [SeedMultiUrlEnvironmentClient::AsyncEc2Client]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param size [String]
    # @param request_options [SeedMultiUrlEnvironmentClient::RequestOptions]
    # @return [Void]
    # @example
    #  multi_url_environment = SeedMultiUrlEnvironmentClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedMultiUrlEnvironmentClient::Environment::PRODUCTION,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  multi_url_environment.ec_2.boot_instance(size: "size")
    def boot_instance(size:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request_options&.additional_body_parameters || {}), size: size }.compact
          req.url "#{@request_client.get_url(environment: ec2, request_options: request_options)}/ec2/boot"
        end
      end
    end
  end
end
