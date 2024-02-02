# frozen_string_literal: true

require "async"

module SeedMultiUrlEnvironmentClient
  module S3
    class S3Client
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [S3::S3Client]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param s_3_key [String]
      # @param request_options [RequestOptions]
      # @return [String]
      def get_presigned_url(s_3_key:, request_options: nil)
        @request_client.conn.post("/s3/presigned-url") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request_options&.additional_body_parameters, s3Key: s_3_key }.compact
          req.url = @request_client.default_environment[s3]
        end
      end
    end

    class AsyncS3Client
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [S3::AsyncS3Client]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param s_3_key [String]
      # @param request_options [RequestOptions]
      # @return [String]
      def get_presigned_url(s_3_key:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/s3/presigned-url") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request_options&.additional_body_parameters, s3Key: s_3_key }.compact
            req.url = @request_client.default_environment[s3]
          end
          response
        end
      end
    end
  end
end
