# frozen_string_literal: true

module FernUnionsWithLocalDate
  module Bigunion
    class Client
      # @param client [FernUnionsWithLocalDate::Internal::Http::RawClient]
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
      # @return [FernUnionsWithLocalDate::Bigunion::Types::BigUnion]
      def get(request_options: {}, **params)
        params = FernUnionsWithLocalDate::Internal::Types::Utils.normalize_keys(params)
        request = FernUnionsWithLocalDate::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/#{params[:id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUnionsWithLocalDate::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernUnionsWithLocalDate::Bigunion::Types::BigUnion.load(response.body)
        else
          error_class = FernUnionsWithLocalDate::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernUnionsWithLocalDate::Bigunion::Types::BigUnion]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [Boolean]
      def update(request_options: {}, **params)
        params = FernUnionsWithLocalDate::Internal::Types::Utils.normalize_keys(params)
        request = FernUnionsWithLocalDate::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "",
          body: FernUnionsWithLocalDate::Bigunion::Types::BigUnion.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUnionsWithLocalDate::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUnionsWithLocalDate::Errors::ResponseError.subclass_for_code(code)
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
        params = FernUnionsWithLocalDate::Internal::Types::Utils.normalize_keys(params)
        request = FernUnionsWithLocalDate::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "PATCH",
          path: "/many",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernUnionsWithLocalDate::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernUnionsWithLocalDate::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
