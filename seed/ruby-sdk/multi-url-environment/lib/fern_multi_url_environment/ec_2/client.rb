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
    #   require "fern_multi_url_environment"
    #
    # multi_url_environment = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @return [String]
    #  attr_reader :default_environment
    #  # @param environment [SeedMultiUrlEnvironmentClient::Environment]
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedMultiUrlEnvironmentClient::RequestClient]
    #  def initialize(environment: Environment::PRODUCTION, base_url: nil,
    #  max_retries: nil, timeout_in_seconds: nil, token:)
    #  @default_environment = environment
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_multi_url_environment', "X-Fern-SDK-Version": '0.0.1', "Authorization":
    #  'Bearer #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedMultiUrlEnvironmentClient::RequestOptions]
    #  # @param environment [String]
    #  # @return [String]
    #  def get_url(request_options: nil, environment:)
    #  request_options&.base_url || @default_environment[environment] || @base_url
    #  end
    #  end.new
    #
    # multi_url_environment.boot_instance
    def boot_instance(size:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
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
    #   require "fern_multi_url_environment"
    #
    # multi_url_environment = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @return [String]
    #  attr_reader :default_environment
    #  # @param environment [SeedMultiUrlEnvironmentClient::Environment]
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @param token [String]
    #  # @return [SeedMultiUrlEnvironmentClient::RequestClient]
    #  def initialize(environment: Environment::PRODUCTION, base_url: nil,
    #  max_retries: nil, timeout_in_seconds: nil, token:)
    #  @default_environment = environment
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_multi_url_environment', "X-Fern-SDK-Version": '0.0.1', "Authorization":
    #  'Bearer #{token}' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :json
    #  faraday.response :raise_error, include_request: true
    #  unless max_retries.nil?
    #  faraday.request :retry ,  { max: max_retries }
    #  end
    #  unless timeout_in_seconds.nil?
    #  faraday.options.timeout = timeout_in_seconds
    #  end
    #  end
    #  end
    #  # @param request_options [SeedMultiUrlEnvironmentClient::RequestOptions]
    #  # @param environment [String]
    #  # @return [String]
    #  def get_url(request_options: nil, environment:)
    #  request_options&.base_url || @default_environment[environment] || @base_url
    #  end
    #  end.new
    #
    # multi_url_environment.boot_instance
    def boot_instance(size:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), size: size }.compact
          req.url "#{@request_client.get_url(environment: ec2, request_options: request_options)}/ec2/boot"
        end
      end
    end
  end
end
