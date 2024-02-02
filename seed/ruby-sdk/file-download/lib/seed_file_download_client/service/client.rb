# frozen_string_literal: true
require "async"

module SeedFileDownloadClient
  module Service
    class ServiceClient
      attr_reader :request_client
      # @param request_client [RequestClient] 
      # @return [Service::ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient] 
        @request_client = request_client
      end
      # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which will receive tuples of strings, the sum of characters received so far, and the response environment. The latter will allow access to the response status, headers and reason, as well as the request info.
      # @param request_options [RequestOptions] 
      # @return [Void]
      def download_file(&on_data, request_options: nil)
        response = @request_client.conn.post("/") do | req |
  unless request_options.timeout_in_seconds.nil?()
    req.options.timeout = request_options.timeout_in_seconds
  end
  req.headers = { **req.headers, **request_options&.additional_headers }.compact
  req.options.on_data = &on_data
end
      end
    end
    class AsyncServiceClient
      attr_reader :request_client
      # @param request_client [AsyncRequestClient] 
      # @return [Service::AsyncServiceClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient] 
        @request_client = request_client
      end
      # @yield on_data[chunk, overall_received_bytes, env] Leverage the Faraday on_data callback which will receive tuples of strings, the sum of characters received so far, and the response environment. The latter will allow access to the response status, headers and reason, as well as the request info.
      # @param request_options [RequestOptions] 
      # @return [Void]
      def download_file(&on_data, request_options: nil)
        Async.() do
          response = @request_client.conn.post("/") do | req |
  unless request_options.timeout_in_seconds.nil?()
    req.options.timeout = request_options.timeout_in_seconds
  end
  req.headers = { **req.headers, **request_options&.additional_headers }.compact
  req.options.on_data = &on_data
end
        end
      end
    end
  end
end