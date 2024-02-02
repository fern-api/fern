# frozen_string_literal: true

require "async"

module SeedTraceClient
  module Sysprop
    class SyspropClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Sysprop::SyspropClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param language [Hash{String => String}]
      # @param num_warm_instances [Integer]
      # @param request_options [RequestOptions]
      # @return [Void]
      def set_num_warm_instances(language:, num_warm_instances:, request_options: nil)
        @request_client.conn.put("/sysprop/num-warm-instances/#{language}/#{num_warm_instances}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end

      # @param request_options [RequestOptions]
      # @return [Hash{LANGUAGE => LANGUAGE}]
      def get_num_warm_instances(request_options: nil)
        response = @request_client.conn.get("/sysprop/num-warm-instances") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        response.transform_values do |_k, v|
          v = v.to_h.to_json
          LANGUAGE.key(v)
        end
      end
    end

    class AsyncSyspropClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Sysprop::AsyncSyspropClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param language [Hash{String => String}]
      # @param num_warm_instances [Integer]
      # @param request_options [RequestOptions]
      # @return [Void]
      def set_num_warm_instances(language:, num_warm_instances:, request_options: nil)
        Async.call do
          @request_client.conn.put("/sysprop/num-warm-instances/#{language}/#{num_warm_instances}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end

      # @param request_options [RequestOptions]
      # @return [Hash{LANGUAGE => LANGUAGE}]
      def get_num_warm_instances(request_options: nil)
        Async.call do
          response = @request_client.conn.get("/sysprop/num-warm-instances") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header if @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          response.transform_values do |_k, v|
            v = v.to_h.to_json
            LANGUAGE.key(v)
          end
        end
      end
    end
  end
end
