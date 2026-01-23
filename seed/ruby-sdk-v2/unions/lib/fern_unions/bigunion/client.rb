# frozen_string_literal: true

module FernUnions
  module Bigunion
    class Client
      # @param client [FernUnions::Internal::Http::RawClient]
      #
      # @return [void]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      # @option params [String] :id
      #
      # @return [FernUnions::Bigunion::Types::BigUnion]
      def get(request_options: {}, **params)
        params = FernUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/#{params[:id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernUnions::Bigunion::Types::BigUnion.load(response.body)
        else
          error_class = FernUnions::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernUnions::Bigunion::Types::BigUnion]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def update(request_options: {}, **params)
        params = FernUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "",
          body: FernUnions::Bigunion::Types::BigUnion.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUnions::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end

      # @param request_options [Hash]
      # @param params [Hash]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Hash[String, Boolean]]
      def update_many(request_options: {}, **params)
        params = FernUnions::Internal::Types::Utils.normalize_keys(params)
        request = FernUnions::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/many",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUnions::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUnions::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
