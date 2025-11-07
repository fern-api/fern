# frozen_string_literal: true

module Seed
  module Endpoints
    module Params
      class Client
        # @return [Seed::Endpoints::Params::Client]
        def initialize(client:)
          @client = client
        end

        # GET with path param
        #
        # @return [String]
        def get_with_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}"
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

        # GET with path param
        #
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path/#{params[:param]}"
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

        # GET with query param
        #
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[query number]
          _query = {}
          _query["query"] = params[:query] if params.key?(:query)
          _query["number"] = params[:number] if params.key?(:number)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params",
            query: _query
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

        # GET with multiple of same query param
        #
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[query number]
          _query = {}
          _query["query"] = params[:query] if params.key?(:query)
          _query["number"] = params[:number] if params.key?(:number)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params",
            query: _query
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

        # GET with path and query params
        #
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[query]
          _query = {}
          _query["query"] = params[:query] if params.key?(:query)
          params = params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
            query: _query
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

        # GET with path and query params
        #
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          params = Seed::Internal::Types::Utils.symbolize_keys(params)
          _query_param_names = %i[query]
          _query = {}
          _query["query"] = params[:query] if params.key?(:query)
          params = params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
            query: _query
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

        # PUT to update with path param
        #
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
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

        # PUT to update with path param
        #
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url],
            method: "PUT",
            path: "/params/path/#{params[:param]}",
            body: _body
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
end
