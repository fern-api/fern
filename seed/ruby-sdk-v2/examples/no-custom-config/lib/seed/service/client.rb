# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
      #
      # @return [Seed::Service::Client]
      def initialize(client:)
        @client = client
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [Seed::Types::Types::MovieId] :movie_id
      #
      # @return [Seed::Types::Types::Movie]
      def get_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/movie/#{params[:movie_id]}"
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Movie.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Types::Types::Movie]
      #
      # @return [String]
      def create_movie(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/movie",
          body: Seed::Types::Types::Movie.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::MovieId.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      # @option params [bool | nil] :shallow
      # @option params [String | nil] :tag
      # @option params [String] :x_api_version
      #
      # @return [Seed::Types::Types::Metadata]
      def get_metadata(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.symbolize_keys(params)
        _query_param_names = %i[shallow tag]
        _query = {}
        _query["shallow"] = params[:shallow] if params.key?(:shallow)
        _query["tag"] = params[:tag] if params.key?(:tag)
        params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/metadata",
          query: _query
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Metadata.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Seed::Types::Types::BigEntity]
      #
      # @return [Seed::Types::Types::Response]
      def create_big_entity(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/big-entity",
          body: Seed::Types::Types::BigEntity.new(params).to_h
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Response.load(_response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(_response.body, code: code)
        end
      end

      # @param request_options [Seed::RequestOptions]
      # @param params [Hash[untyped, untyped]]
      #
      # @return [untyped]
      def refresh_token(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/refresh-token",
          body: params
        )
        begin
          _response = @client.send(_request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = _response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(_response.body, code: code)
      end
    end
  end
end
