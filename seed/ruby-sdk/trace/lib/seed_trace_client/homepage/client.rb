# frozen_string_literal: true

require_relative "../commons/types/problem_id"
require "async"

module SeedTraceClient
  module Homepage
    class HomepageClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [HomepageClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Array<Commons::PROBLEM_ID>]
      def get_homepage_problems(request_options: nil)
        @request_client.conn.get("/homepage-problems") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end

      # @param request [Array<Commons::PROBLEM_ID>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def set_homepage_problems(request:, request_options: nil)
        @request_client.conn.post("/homepage-problems") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end
    end

    class AsyncHomepageClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncHomepageClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request_options [RequestOptions]
      # @return [Array<Commons::PROBLEM_ID>]
      def get_homepage_problems(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/homepage-problems") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          response
        end
      end

      # @param request [Array<Commons::PROBLEM_ID>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def set_homepage_problems(request:, request_options: nil)
        Async.call do
          @request_client.conn.post("/homepage-problems") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
        end
      end
    end
  end
end
