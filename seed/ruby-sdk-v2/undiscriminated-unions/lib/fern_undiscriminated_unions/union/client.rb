# frozen_string_literal: true

module FernUndiscriminatedUnions
  module Union
    class Client
      # @param client [FernUndiscriminatedUnions::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [FernUndiscriminatedUnions::Union::Types::MyUnion]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernUndiscriminatedUnions::Union::Types::MyUnion]
      def get(request_options: {}, **params)
        params = FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "",
          body: FernUndiscriminatedUnions::Union::Types::MyUnion.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernUndiscriminatedUnions::Union::Types::MyUnion.load(response.body)
        else
          error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Hash[FernUndiscriminatedUnions::Union::Types::Key, String]]
      def get_metadata(request_options: {}, **params)
        FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/metadata",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernUndiscriminatedUnions::Union::Types::Metadata.load(response.body)
        else
          error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernUndiscriminatedUnions::Union::Types::MetadataUnion]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def update_metadata(request_options: {}, **params)
        params = FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PUT",
          path: "/metadata",
          body: FernUndiscriminatedUnions::Union::Types::MetadataUnion.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernUndiscriminatedUnions::Union::Types::Request]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def call(request_options: {}, **params)
        params = FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/call",
          body: FernUndiscriminatedUnions::Union::Types::Request.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernUndiscriminatedUnions::Union::Types::UnionWithDuplicateTypes]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernUndiscriminatedUnions::Union::Types::UnionWithDuplicateTypes]
      def duplicate_types_union(request_options: {}, **params)
        params = FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/duplicate",
          body: FernUndiscriminatedUnions::Union::Types::UnionWithDuplicateTypes.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernUndiscriminatedUnions::Union::Types::UnionWithDuplicateTypes.load(response.body)
        else
          error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernUndiscriminatedUnions::Union::Types::NestedUnionRoot]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def nested_unions(request_options: {}, **params)
        params = FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/nested",
          body: FernUndiscriminatedUnions::Union::Types::NestedUnionRoot.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [FernUndiscriminatedUnions::Union::Types::PaymentRequest]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def test_camel_case_properties(request_options: {}, **params)
        params = FernUndiscriminatedUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUndiscriminatedUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/camel-case",
          body: FernUndiscriminatedUnions::Union::Types::PaymentRequest.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUndiscriminatedUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUndiscriminatedUnions::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
