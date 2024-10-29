# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/operand"
require_relative "../types/color_or_operand"
require "async"

module SeedEnumClient
  class PathParamClient
    # @return [SeedEnumClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedEnumClient::RequestClient]
    # @return [SeedEnumClient::PathParamClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param operand [SeedEnumClient::Operand]
    # @param operand_or_color [SeedEnumClient::Color, SeedEnumClient::Operand]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    # @example
    #  enum = SeedEnumClient::Client.new(base_url: "https://api.example.com")
    #  enum.path_param.send(operand: GREATER_THAN, operand_or_color: RED)
    def send(operand:, operand_or_color:, request_options: nil)
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
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/path/#{operand}/#{operand_or_color}"
      end
    end
  end

  class AsyncPathParamClient
    # @return [SeedEnumClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedEnumClient::AsyncRequestClient]
    # @return [SeedEnumClient::AsyncPathParamClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param operand [SeedEnumClient::Operand]
    # @param operand_or_color [SeedEnumClient::Color, SeedEnumClient::Operand]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    # @example
    #  enum = SeedEnumClient::Client.new(base_url: "https://api.example.com")
    #  enum.path_param.send(operand: GREATER_THAN, operand_or_color: RED)
    def send(operand:, operand_or_color:, request_options: nil)
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
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/path/#{operand}/#{operand_or_color}"
        end
      end
    end
  end
end
