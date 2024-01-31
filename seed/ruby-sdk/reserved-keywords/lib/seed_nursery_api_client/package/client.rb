# frozen_string_literal: true

require "async"

module SeedNurseryApiClient
  module Package
    class PackageClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [PackageClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param for_ [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def test(for_:, request_options: nil)
        @request_client.conn.post("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = { **request_options&.additional_query_parameters, "for": for_ }.compact
        end
      end
    end

    class AsyncPackageClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncPackageClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param for_ [String]
      # @param request_options [RequestOptions]
      # @return [Void]
      def test(for_:, request_options: nil)
        Async.call do
          @request_client.conn.post("/") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = { **request_options&.additional_query_parameters, "for": for_ }.compact
          end
        end
      end
    end
  end
end
