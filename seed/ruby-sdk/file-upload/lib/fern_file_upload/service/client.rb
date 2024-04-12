# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/my_object"
require_relative "../../core/file_utilities"
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

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param file [String, IO]
    # @param file_list [String, IO]
    # @param maybe_file [String, IO]
    # @param maybe_file_list [String, IO]
    # @param maybe_integer [Integer]
    # @param optional_list_of_strings [Array<String>]
    # @param list_of_objects [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObject>, as a Hash
    #   * :foo (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_file_upload"
    #
    # file_upload = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @return [SeedFileUploadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_upload', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileUploadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_upload.post
    def post(integer:, file:, file_list:, list_of_objects:, maybe_string: nil, maybe_file: nil, maybe_file_list: nil, maybe_integer: nil,
             optional_list_of_strings: nil, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          maybeString: maybe_string,
          integer: integer,
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
          fileList: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file_list),
          maybeFile: unless maybe_file.nil?
                       SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file)
                     end,
          maybeFileList: unless maybe_file_list.nil?
                           SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file_list)
                         end,
          maybeInteger: maybe_integer,
          optionalListOfStrings: optional_list_of_strings,
          listOfObjects: list_of_objects
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/"
      end
    end

    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_file_upload"
    #
    # file_upload = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @return [SeedFileUploadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_upload', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileUploadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_upload.just_file
    def just_file(file:, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/just-file"
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param maybe_integer [Integer]
    # @param list_of_strings [String]
    # @param optional_list_of_strings [String]
    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_file_upload"
    #
    # file_upload = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @return [SeedFileUploadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_upload', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileUploadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_upload.just_file_with_query_params
    def just_file_with_query_params(integer:, list_of_strings:, file:, maybe_string: nil, maybe_integer: nil,
                                    optional_list_of_strings: nil, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "maybeString": maybe_string,
          "integer": integer,
          "maybeInteger": maybe_integer,
          "listOfStrings": list_of_strings,
          "optionalListOfStrings": optional_list_of_strings
        }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
        }.compact
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

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param file [String, IO]
    # @param file_list [String, IO]
    # @param maybe_file [String, IO]
    # @param maybe_file_list [String, IO]
    # @param maybe_integer [Integer]
    # @param optional_list_of_strings [Array<String>]
    # @param list_of_objects [Array<Hash>] Request of type Array<SeedFileUploadClient::Service::MyObject>, as a Hash
    #   * :foo (String)
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_file_upload"
    #
    # file_upload = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @return [SeedFileUploadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_upload', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileUploadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_upload.post
    def post(integer:, file:, file_list:, list_of_objects:, maybe_string: nil, maybe_file: nil, maybe_file_list: nil, maybe_integer: nil,
             optional_list_of_strings: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            maybeString: maybe_string,
            integer: integer,
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file),
            fileList: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file_list),
            maybeFile: unless maybe_file.nil?
                         SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file)
                       end,
            maybeFileList: unless maybe_file_list.nil?
                             SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: maybe_file_list)
                           end,
            maybeInteger: maybe_integer,
            optionalListOfStrings: optional_list_of_strings,
            listOfObjects: list_of_objects
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_file_upload"
    #
    # file_upload = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @return [SeedFileUploadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_upload', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileUploadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_upload.just_file
    def just_file(file:, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/just-file"
        end
      end
    end

    # @param maybe_string [String]
    # @param integer [Integer]
    # @param maybe_integer [Integer]
    # @param list_of_strings [String]
    # @param optional_list_of_strings [String]
    # @param file [String, IO]
    # @param request_options [SeedFileUploadClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_file_upload"
    #
    # file_upload = class RequestClient
    #  # @return [Hash{String => String}]
    #  attr_reader :headers
    #  # @return [Faraday]
    #  attr_reader :conn
    #  # @return [String]
    #  attr_reader :base_url
    #  # @param base_url [String]
    #  # @param max_retries [Long] The number of times to retry a failed request,
    #  defaults to 2.
    #  # @param timeout_in_seconds [Long]
    #  # @return [SeedFileUploadClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name":
    #  'fern_file_upload', "X-Fern-SDK-Version": '0.0.1' }
    #  @conn = Faraday.new(headers: @headers) do | faraday |
    #  faraday.request :multipart
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
    #  # @param request_options [SeedFileUploadClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # file_upload.just_file_with_query_params
    def just_file_with_query_params(integer:, list_of_strings:, file:, maybe_string: nil, maybe_integer: nil,
                                    optional_list_of_strings: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "maybeString": maybe_string,
            "integer": integer,
            "maybeInteger": maybe_integer,
            "listOfStrings": list_of_strings,
            "optionalListOfStrings": optional_list_of_strings
          }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            file: SeedFileUploadClient::FileUtilities.as_faraday_multipart(file_like: file)
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/just-file-with-query-params"
        end
      end
    end
  end
end
