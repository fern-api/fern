# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/resource"
require "date"
require "async"

module SeedMixedCaseClient
  class ServiceClient
    attr_reader :request_client

    # @param request_client [SeedMixedCaseClient::RequestClient]
    # @return [SeedMixedCaseClient::ServiceClient]
    def initialize(request_client:)
      # @type [SeedMixedCaseClient::RequestClient]
      @request_client = request_client
    end

    # @param resource_id [String]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [SeedMixedCaseClient::Service::Resource]
    def get_resource(resource_id:, request_options: nil)
      response = @request_client.conn.get("/resource/#{resource_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/resource/#{resource_id}"
      end
      SeedMixedCaseClient::Service::Resource.from_json(json_object: response.body)
    end

    # @param page_limit [Integer]
    # @param before_date [Date]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [Array<SeedMixedCaseClient::Service::Resource>]
    def list_resources(page_limit:, before_date:, request_options: nil)
      response = @request_client.conn.get("/resource") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "page_limit": page_limit,
          "beforeDate": before_date
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/resource"
      end
      return if response.body.nil?

      response.body.map do |v|
        v = v.to_json
        SeedMixedCaseClient::Service::Resource.from_json(json_object: v)
      end
    end
  end

  class AsyncServiceClient
    attr_reader :request_client

    # @param request_client [SeedMixedCaseClient::AsyncRequestClient]
    # @return [SeedMixedCaseClient::AsyncServiceClient]
    def initialize(request_client:)
      # @type [SeedMixedCaseClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param resource_id [String]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [SeedMixedCaseClient::Service::Resource]
    def get_resource(resource_id:, request_options: nil)
      Async do
        response = @request_client.conn.get("/resource/#{resource_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/resource/#{resource_id}"
        end
        SeedMixedCaseClient::Service::Resource.from_json(json_object: response.body)
      end
    end

    # @param page_limit [Integer]
    # @param before_date [Date]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [Array<SeedMixedCaseClient::Service::Resource>]
    def list_resources(page_limit:, before_date:, request_options: nil)
      Async do
        response = @request_client.conn.get("/resource") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "page_limit": page_limit,
            "beforeDate": before_date
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/resource"
        end
        response.body&.map do |v|
          v = v.to_json
          SeedMixedCaseClient::Service::Resource.from_json(json_object: v)
        end
      end
    end
  end
end
