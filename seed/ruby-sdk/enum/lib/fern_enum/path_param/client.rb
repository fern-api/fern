# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/operand"
require_relative "../types/color_or_operand"
require "async"

module SeedEnumClient
  class PathParamClient
    attr_reader :request_client

    # @param request_client [SeedEnumClient::RequestClient]
    # @return [SeedEnumClient::PathParamClient]
    def initialize(request_client:)
      # @type [SeedEnumClient::RequestClient]
      @request_client = request_client
    end

    # @param operand [SeedEnumClient::Operand]
    # @param maybe_operand [SeedEnumClient::Operand]
    # @param operand_or_color [SeedEnumClient::Color, SeedEnumClient::Operand]
    # @param maybe_operand_or_color [SeedEnumClient::Color, SeedEnumClient::Operand]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    def send(operand:, operand_or_color:, maybe_operand: nil, maybe_operand_or_color: nil, request_options: nil)
      @request_client.conn.post("/path/#{operand}/#{maybe_operand}/#{operand_or_color}/#{maybe_operand_or_color}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/path/#{operand}/#{maybe_operand}/#{operand_or_color}/#{maybe_operand_or_color}"
      end
    end
  end

  class AsyncPathParamClient
    attr_reader :request_client

    # @param request_client [SeedEnumClient::AsyncRequestClient]
    # @return [SeedEnumClient::AsyncPathParamClient]
    def initialize(request_client:)
      # @type [SeedEnumClient::AsyncRequestClient]
      @request_client = request_client
    end

    # @param operand [SeedEnumClient::Operand]
    # @param maybe_operand [SeedEnumClient::Operand]
    # @param operand_or_color [SeedEnumClient::Color, SeedEnumClient::Operand]
    # @param maybe_operand_or_color [SeedEnumClient::Color, SeedEnumClient::Operand]
    # @param request_options [SeedEnumClient::RequestOptions]
    # @return [Void]
    def send(operand:, operand_or_color:, maybe_operand: nil, maybe_operand_or_color: nil, request_options: nil)
      Async do
        @request_client.conn.post("/path/#{operand}/#{maybe_operand}/#{operand_or_color}/#{maybe_operand_or_color}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/path/#{operand}/#{maybe_operand}/#{operand_or_color}/#{maybe_operand_or_color}"
        end
      end
    end
  end
end
