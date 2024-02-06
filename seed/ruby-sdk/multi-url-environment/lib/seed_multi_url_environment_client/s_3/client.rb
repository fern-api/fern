# frozen_string_literal: true

require_relative "../../requests"
require "async"

module SeedMultiUrlEnvironmentClient
  class S3Client
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [S3Client]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # @param s_3_key [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def get_presigned_url(s_3_key:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request_options&.additional_body_parameters || {}), s3Key: s_3_key }.compact
        req.url "#{@request_client.default_environment[:s3]}/s3/presigned-url"
      end
      response.body
    end
  end

  class AsyncS3Client
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncS3Client]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # @param s_3_key [String]
    # @param request_options [RequestOptions]
    # @return [String]
    def get_presigned_url(s_3_key:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request_options&.additional_body_parameters || {}), s3Key: s_3_key }.compact
          req.url "#{@request_client.default_environment[:s3]}/s3/presigned-url"
        end
        response.body
      end
    end
  end
end
