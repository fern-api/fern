# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedFileUploadClient
  class ServiceClient
    # @return [SeedFileUploadClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedFileUploadClient::RequestClient]
    # @return [SeedFileUploadClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.post
    def post(request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end

    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.just_file
    def just_file(request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/just-file"
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param maybe_integer [Integer]
    # @param list_of_strings [String]
    # @param optional_list_of_strings [String]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.just_file_with_query_params(
    #    maybe_string: "string",
    #    integer: 1,
    #    maybe_integer: 1,
    #    list_of_strings: "string",
    #    optional_list_of_strings: "string"
    #  )
    def just_file_with_query_params(integer:, list_of_strings:, maybe_string: nil, maybe_integer: nil,
                                    optional_list_of_strings: nil, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "maybeString": maybe_string,
          "integer": integer,
          "maybeInteger": maybe_integer,
          "listOfStrings": list_of_strings,
          "optionalListOfStrings": optional_list_of_strings
        }.compact
        req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/just-file-with-query-params"
      end
    end
  end

  class AsyncServiceClient
    # @return [SeedFileUploadClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedFileUploadClient::AsyncRequestClient]
    # @return [SeedFileUploadClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.post
    def post(request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.just_file
    def just_file(request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/just-file"
        end
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param maybe_integer [Integer]
    # @param list_of_strings [String]
    # @param optional_list_of_strings [String]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #  file_upload = SeedFileUploadClient::Client.new(base_url: "https://api.example.com")
    #  file_upload.service.just_file_with_query_params(
    #    maybe_string: "string",
    #    integer: 1,
    #    maybe_integer: 1,
    #    list_of_strings: "string",
    #    optional_list_of_strings: "string"
    #  )
    def just_file_with_query_params(integer:, list_of_strings:, maybe_string: nil, maybe_integer: nil,
                                    optional_list_of_strings: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "maybeString": maybe_string,
            "integer": integer,
            "maybeInteger": maybe_integer,
            "listOfStrings": list_of_strings,
            "optionalListOfStrings": optional_list_of_strings
          }.compact
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/just-file-with-query-params"
        end
      end
    end
  end
end
