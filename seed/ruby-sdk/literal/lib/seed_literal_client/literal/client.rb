# frozen_string_literal: true

require_relative "types/create_options_response"
require_relative "types/options"
require_relative "types/undiscriminated_options"
require "async"

module SeedLiteralClient
  module Literal
    class LiteralClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [LiteralClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param values [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Literal::CreateOptionsResponse]
      def create_options(values:, request_options: nil)
        response = @request_client.conn.post("/options") do |req|
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request_options&.additional_body_parameters, values: values }.compact
        end
        Literal::CreateOptionsResponse.from_json(json_object: response)
      end

      # @param dry_run [Boolean]
      # @param request_options [RequestOptions]
      # @return [Literal::Options]
      def get_options(dry_run:, request_options: nil)
        response = @request_client.conn.post("/options") do |req|
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request_options&.additional_body_parameters, dryRun: dry_run }.compact
        end
        Literal::Options.from_json(json_object: response)
      end

      # @param dry_run [Boolean]
      # @param request_options [RequestOptions]
      # @return [Literal::UndiscriminatedOptions]
      def get_undiscriminated_options(dry_run:, request_options: nil)
        response = @request_client.conn.post("/options") do |req|
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request_options&.additional_body_parameters, dryRun: dry_run }.compact
        end
        Literal::UndiscriminatedOptions.from_json(json_object: response)
      end
    end

    class AsyncLiteralClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncLiteralClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param values [Hash{String => String}]
      # @param request_options [RequestOptions]
      # @return [Literal::CreateOptionsResponse]
      def create_options(values:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/options") do |req|
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request_options&.additional_body_parameters, values: values }.compact
          end
          Literal::CreateOptionsResponse.from_json(json_object: response)
        end
      end

      # @param dry_run [Boolean]
      # @param request_options [RequestOptions]
      # @return [Literal::Options]
      def get_options(dry_run:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/options") do |req|
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request_options&.additional_body_parameters, dryRun: dry_run }.compact
          end
          Literal::Options.from_json(json_object: response)
        end
      end

      # @param dry_run [Boolean]
      # @param request_options [RequestOptions]
      # @return [Literal::UndiscriminatedOptions]
      def get_undiscriminated_options(dry_run:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/options") do |req|
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request_options&.additional_body_parameters, dryRun: dry_run }.compact
          end
          Literal::UndiscriminatedOptions.from_json(json_object: response)
        end
      end
    end
  end
end
