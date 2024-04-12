# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedApiClient
  module Folder
    class FolderClient
      # @return [SeedApiClient::RequestClient]
      attr_reader :request_client

      # @param request_client [SeedApiClient::RequestClient]
      # @return [SeedApiClient::Folder::FolderClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedApiClient::RequestOptions]
      # @return [Void]
      # @example
      #   require "fern_folders"
      #
      # api = class RequestClient
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
      #  # @return [SeedApiClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_folders',
      #  "X-Fern-SDK-Version": '0.0.1' }
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
      #  # @param request_options [SeedApiClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # api.foo
      def foo(request_options: nil)
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/"
        end
      end
    end

    class AsyncFolderClient
      # @return [SeedApiClient::AsyncRequestClient]
      attr_reader :request_client

      # @param request_client [SeedApiClient::AsyncRequestClient]
      # @return [SeedApiClient::Folder::AsyncFolderClient]
      def initialize(request_client:)
        @request_client = request_client
      end

      # @param request_options [SeedApiClient::RequestOptions]
      # @return [Void]
      # @example
      #   require "fern_folders"
      #
      # api = class RequestClient
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
      #  # @return [SeedApiClient::RequestClient]
      #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
      #  @base_url = base_url
      #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_folders',
      #  "X-Fern-SDK-Version": '0.0.1' }
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
      #  # @param request_options [SeedApiClient::RequestOptions]
      #  # @return [String]
      #  def get_url(request_options: nil)
      #  request_options&.base_url || @base_url
      #  end
      #  end.new
      #
      # api.foo
      def foo(request_options: nil)
        Async do
          @request_client.conn.post do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
            req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
            req.url "#{@request_client.get_url(request_options: request_options)}/"
          end
        end
      end
    end
  end
end
