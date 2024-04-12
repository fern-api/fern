# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/operand"
require "async"

module SeedEnumClient
  class QueryParamClient
    # @return [SeedEnumClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedEnumClient::RequestClient]
    # @return [SeedEnumClient::QueryParamClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param operand [SeedEnumClient::Operand]
    # @param maybe_operand [SeedEnumClient::Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_enum"
    #
    # enum = class RequestClient
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
    #  # @return [SeedEnumClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_enum',
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
    #  # @param request_options [SeedEnumClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # enum.send
    def send(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil, request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "operand": operand,
          "maybeOperand": maybe_operand,
          "operandOrColor": operand_or_color,
          "maybeOperandOrColor": maybe_operand_or_color
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/query"
      end
    end

    # @param operand [SeedEnumClient::Operand]
    # @param maybe_operand [SeedEnumClient::Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_enum"
    #
    # enum = class RequestClient
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
    #  # @return [SeedEnumClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_enum',
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
    #  # @param request_options [SeedEnumClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # enum.send_list
    def send_list(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil,
                  request_options: nil)
      @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "operand": operand,
          "maybeOperand": maybe_operand,
          "operandOrColor": operand_or_color,
          "maybeOperandOrColor": maybe_operand_or_color
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/query-list"
      end
    end
  end

  class AsyncQueryParamClient
    # @return [SeedEnumClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedEnumClient::AsyncRequestClient]
    # @return [SeedEnumClient::AsyncQueryParamClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param operand [SeedEnumClient::Operand]
    # @param maybe_operand [SeedEnumClient::Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_enum"
    #
    # enum = class RequestClient
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
    #  # @return [SeedEnumClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_enum',
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
    #  # @param request_options [SeedEnumClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # enum.send
    def send(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil, request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "operand": operand,
            "maybeOperand": maybe_operand,
            "operandOrColor": operand_or_color,
            "maybeOperandOrColor": maybe_operand_or_color
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/query"
        end
      end
    end

    # @param operand [SeedEnumClient::Operand]
    # @param maybe_operand [SeedEnumClient::Operand]
    # @param operand_or_color [String]
    # @param maybe_operand_or_color [String]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    # @example
    #   require "fern_enum"
    #
    # enum = class RequestClient
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
    #  # @return [SeedEnumClient::RequestClient]
    #  def initialize(base_url: nil, max_retries: nil, timeout_in_seconds: nil)
    #  @base_url = base_url
    #  @headers = { "X-Fern-Language": 'Ruby', "X-Fern-SDK-Name": 'fern_enum',
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
    #  # @param request_options [SeedEnumClient::RequestOptions]
    #  # @return [String]
    #  def get_url(request_options: nil)
    #  request_options&.base_url || @base_url
    #  end
    #  end.new
    #
    # enum.send_list
    def send_list(operand:, maybe_operand: nil, operand_or_color: nil, maybe_operand_or_color: nil,
                  request_options: nil)
      Async do
        @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "operand": operand,
            "maybeOperand": maybe_operand,
            "operandOrColor": operand_or_color,
            "maybeOperandOrColor": maybe_operand_or_color
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/query-list"
        end
      end
    end
  end
end
