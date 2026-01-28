# frozen_string_literal: true

module FernExamples
  module Service
    class Client
      # @param client [FernExamples::Internal::Http::RawClient]
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
      # @option params [FernExamples::Types::Types::MovieId] :movie_id
      #
      # @return [FernExamples::Types::Types::Movie]
      def get_movie(request_options: {}, **params)
        params = FernExamples::Internal::Types::Utils.normalize_keys(params)
        request = FernExamples::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/movie/#{params[:movie_id]}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernExamples::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernExamples::Types::Types::Movie.load(response.body)
        else
          error_class = FernExamples::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernExamples::Types::Types::Movie]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [String]
      def create_movie(request_options: {}, **params)
        params = FernExamples::Internal::Types::Utils.normalize_keys(params)
        request = FernExamples::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/movie",
          body: FernExamples::Types::Types::Movie.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernExamples::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernExamples::Types::Types::MovieId.load(response.body)
        else
          error_class = FernExamples::Errors::ResponseError.subclass_for_code(code)
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
      # @option params [Boolean, nil] :shallow
      # @option params [String, nil] :tag
      # @option params [String] :x_api_version
      #
      # @return [FernExamples::Types::Types::Metadata]
      def get_metadata(request_options: {}, **params)
        params = FernExamples::Internal::Types::Utils.normalize_keys(params)
        query_param_names = %i[shallow tag]
        query_params = {}
        query_params["shallow"] = params[:shallow] if params.key?(:shallow)
        query_params["tag"] = params[:tag] if params.key?(:tag)
        params = params.except(*query_param_names)

        headers = {}
        headers["X-API-Version"] = params[:x_api_version] if params[:x_api_version]

        request = FernExamples::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/metadata",
          headers: headers,
          query: query_params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernExamples::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernExamples::Types::Types::Metadata.load(response.body)
        else
          error_class = FernExamples::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [FernExamples::Types::Types::BigEntity]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @return [FernExamples::Types::Types::Response]
      def create_big_entity(request_options: {}, **params)
        params = FernExamples::Internal::Types::Utils.normalize_keys(params)
        request = FernExamples::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/big-entity",
          body: FernExamples::Types::Types::BigEntity.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernExamples::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          FernExamples::Types::Types::Response.load(response.body)
        else
          error_class = FernExamples::Errors::ResponseError.subclass_for_code(code)
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
      # @return [untyped]
      def refresh_token(request_options: {}, **params)
        params = FernExamples::Internal::Types::Utils.normalize_keys(params)
        request = FernExamples::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/refresh-token",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise FernExamples::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = FernExamples::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
