# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedMultiUrlEnvironmentClient
  class Ec2Client
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [Ec2Client]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param size [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def boot_instance(size:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), size: size }.compact
        req.url "#{@request_client.default_environment[:ec2]}/ec2/boot"
      end
    end
  end

  class AsyncEc2Client
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncEc2Client]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param size [String]
    # @param request_options [RequestOptions]
    # @return [Void]
    def boot_instance(size:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), size: size }.compact
          req.url "#{@request_client.default_environment[:ec2]}/ec2/boot"
        end
      end
    end
  end
end
