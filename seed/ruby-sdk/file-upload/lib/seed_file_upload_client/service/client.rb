# frozen_string_literal: true

require "set"
require_relative "types/maybe_list"
require_relative "types/maybe_list_or_set"
require_relative "types/my_object"
require "async"

module SeedFileUploadClient
  module Service
    class ServiceClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Service::ServiceClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param maybe_string [String]
      # @param integer [Integer]
      # @param file [String, IO]
      # @param maybe_file [String, IO]
      # @param maybe_integer [Integer]
      # @param list_of_strings [Array<String>]
      # @param set_of_strings [Set<String>]
      # @param optional_list_of_strings [Array<String>]
      # @param optional_set_of_strings [Set<String>]
      # @param maybe_list [Hash] Request of type Service::MaybeList, as a Hash
      # @param optional_maybe_list [Hash] Request of type Service::MaybeList, as a Hash
      # @param maybe_list_or_set [Hash] Request of type Service::MaybeListOrSet, as a Hash
      # @param optional_maybe_list_or_set [Hash] Request of type Service::MaybeListOrSet, as a Hash
      # @param list_of_objects [Array<Service::MyObject>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def post(integer:, file:, list_of_strings:, set_of_strings:, maybe_list:, maybe_list_or_set:, list_of_objects:,
               maybe_string: nil, maybe_file: nil, maybe_integer: nil, optional_list_of_strings: nil, optional_set_of_strings: nil, optional_maybe_list: nil, optional_maybe_list_or_set: nil, request_options: nil)
        @request_client.conn.post("/") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = {
            **request_options&.additional_body_parameters,
            maybeString: maybe_string,
            integer: integer,
            file: FileUtilities.as_faraday_multipart(file_like: file),
            maybeFile: (FileUtilities.as_faraday_multipart(file_like: maybe_file) if maybe_file.nil?),
            maybeInteger: maybe_integer,
            listOfStrings: list_of_strings,
            setOfStrings: set_of_strings,
            optionalListOfStrings: optional_list_of_strings,
            optionalSetOfStrings: optional_set_of_strings,
            maybeList: maybe_list,
            optionalMaybeList: optional_maybe_list,
            maybeListOrSet: maybe_list_or_set,
            optionalMaybeListOrSet: optional_maybe_list_or_set,
            listOfObjects: list_of_objects
          }.compact
        end
      end

      # @param file [String, IO]
      # @param request_options [RequestOptions]
      # @return [Void]
      def just_file(file:, request_options: nil)
        @request_client.conn.post("/just-file") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = {
            **request_options&.additional_body_parameters,
            file: FileUtilities.as_faraday_multipart(file_like: file)
          }.compact
        end
      end

      # @param maybe_string [String]
      # @param integer [Integer]
      # @param maybe_integer [Integer]
      # @param list_of_strings [String]
      # @param optional_list_of_strings [String]
      # @param file [String, IO]
      # @param request_options [RequestOptions]
      # @return [Void]
      def just_file_with_query_params(integer:, list_of_strings:, file:, maybe_string: nil, maybe_integer: nil,
                                      optional_list_of_strings: nil, request_options: nil)
        @request_client.conn.post("/just-file-with-query-params") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = {
            **request_options&.additional_query_parameters,
            "maybeString": maybe_string,
            "integer": integer,
            "maybeInteger": maybe_integer,
            "listOfStrings": list_of_strings,
            "optionalListOfStrings": optional_list_of_strings
          }.compact
          req.body = {
            **request_options&.additional_body_parameters,
            file: FileUtilities.as_faraday_multipart(file_like: file)
          }.compact
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

      # @param maybe_string [String]
      # @param integer [Integer]
      # @param file [String, IO]
      # @param maybe_file [String, IO]
      # @param maybe_integer [Integer]
      # @param list_of_strings [Array<String>]
      # @param set_of_strings [Set<String>]
      # @param optional_list_of_strings [Array<String>]
      # @param optional_set_of_strings [Set<String>]
      # @param maybe_list [Hash] Request of type Service::MaybeList, as a Hash
      # @param optional_maybe_list [Hash] Request of type Service::MaybeList, as a Hash
      # @param maybe_list_or_set [Hash] Request of type Service::MaybeListOrSet, as a Hash
      # @param optional_maybe_list_or_set [Hash] Request of type Service::MaybeListOrSet, as a Hash
      # @param list_of_objects [Array<Service::MyObject>]
      # @param request_options [RequestOptions]
      # @return [Void]
      def post(integer:, file:, list_of_strings:, set_of_strings:, maybe_list:, maybe_list_or_set:, list_of_objects:,
               maybe_string: nil, maybe_file: nil, maybe_integer: nil, optional_list_of_strings: nil, optional_set_of_strings: nil, optional_maybe_list: nil, optional_maybe_list_or_set: nil, request_options: nil)
        Async.call do
          @request_client.conn.post("/") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = {
              **request_options&.additional_body_parameters,
              maybeString: maybe_string,
              integer: integer,
              file: FileUtilities.as_faraday_multipart(file_like: file),
              maybeFile: (FileUtilities.as_faraday_multipart(file_like: maybe_file) if maybe_file.nil?),
              maybeInteger: maybe_integer,
              listOfStrings: list_of_strings,
              setOfStrings: set_of_strings,
              optionalListOfStrings: optional_list_of_strings,
              optionalSetOfStrings: optional_set_of_strings,
              maybeList: maybe_list,
              optionalMaybeList: optional_maybe_list,
              maybeListOrSet: maybe_list_or_set,
              optionalMaybeListOrSet: optional_maybe_list_or_set,
              listOfObjects: list_of_objects
            }.compact
          end
        end
      end

      # @param file [String, IO]
      # @param request_options [RequestOptions]
      # @return [Void]
      def just_file(file:, request_options: nil)
        Async.call do
          @request_client.conn.post("/just-file") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = {
              **request_options&.additional_body_parameters,
              file: FileUtilities.as_faraday_multipart(file_like: file)
            }.compact
          end
        end
      end

      # @param maybe_string [String]
      # @param integer [Integer]
      # @param maybe_integer [Integer]
      # @param list_of_strings [String]
      # @param optional_list_of_strings [String]
      # @param file [String, IO]
      # @param request_options [RequestOptions]
      # @return [Void]
      def just_file_with_query_params(integer:, list_of_strings:, file:, maybe_string: nil, maybe_integer: nil,
                                      optional_list_of_strings: nil, request_options: nil)
        Async.call do
          @request_client.conn.post("/just-file-with-query-params") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = {
              **request_options&.additional_query_parameters,
              "maybeString": maybe_string,
              "integer": integer,
              "maybeInteger": maybe_integer,
              "listOfStrings": list_of_strings,
              "optionalListOfStrings": optional_list_of_strings
            }.compact
            req.body = {
              **request_options&.additional_body_parameters,
              file: FileUtilities.as_faraday_multipart(file_like: file)
            }.compact
          end
        end
      end
    end
  end
end
