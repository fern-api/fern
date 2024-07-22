# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/resource"
require "date"
require "json"
require "async"

module SeedMixedCaseClient
  class ServiceClient
    # @return [SeedMixedCaseClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedMixedCaseClient::RequestClient]
    # @return [SeedMixedCaseClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param resource_id [String]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [SeedMixedCaseClient::Service::Resource]
    # @example
    #  mixed_case = SeedMixedCaseClient::Client.new(base_url: "https://api.example.com")
    #  mixed_case.service.get_resource(resource_id: "rsc-xyz")
    def get_resource(resource_id:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/resource/#{resource_id}"
      end
      SeedMixedCaseClient::Service::Resource.from_json(json_object: response.body)
    end

    # @param page_limit [Integer]
    # @param before_date [Date]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [Array<SeedMixedCaseClient::Service::Resource>]
    # @example
    #  mixed_case = SeedMixedCaseClient::Client.new(base_url: "https://api.example.com")
    #  mixed_case.service.list_resources(page_limit: 10, before_date: Date.parse("2023-01-01"))
    def list_resources(page_limit:, before_date:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "page_limit": page_limit,
          "beforeDate": before_date
        }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/resource"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |item|
        item = item.to_json
        SeedMixedCaseClient::Service::Resource.from_json(json_object: item)
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedMixedCaseClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedMixedCaseClient::AsyncRequestClient]
    # @return [SeedMixedCaseClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param resource_id [String]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [SeedMixedCaseClient::Service::Resource]
    # @example
    #  mixed_case = SeedMixedCaseClient::Client.new(base_url: "https://api.example.com")
    #  mixed_case.service.get_resource(resource_id: "rsc-xyz")
    def get_resource(resource_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/resource/#{resource_id}"
        end
        SeedMixedCaseClient::Service::Resource.from_json(json_object: response.body)
      end
    end

    # @param page_limit [Integer]
    # @param before_date [Date]
    # @param request_options [SeedMixedCaseClient::RequestOptions]
    # @return [Array<SeedMixedCaseClient::Service::Resource>]
    # @example
    #  mixed_case = SeedMixedCaseClient::Client.new(base_url: "https://api.example.com")
    #  mixed_case.service.list_resources(page_limit: 10, before_date: Date.parse("2023-01-01"))
    def list_resources(page_limit:, before_date:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "page_limit": page_limit,
            "beforeDate": before_date
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/resource"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |item|
          item = item.to_json
          SeedMixedCaseClient::Service::Resource.from_json(json_object: item)
        end
      end
    end
  end
end
