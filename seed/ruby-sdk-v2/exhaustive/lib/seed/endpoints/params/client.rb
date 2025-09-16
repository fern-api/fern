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
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/params/path/#{params[:param]}"
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # GET with path param
        #
        # @return [String]
        def get_with_inline_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/params/path/#{params[:param]}"
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # GET with query param
        #
        # @return [untyped]
        def get_with_query(request_options: {}, **params)
          _query_param_names = [
            %w[query number],
            %i[query number]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/params",
            query: _query
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # GET with multiple of same query param
        #
        # @return [untyped]
        def get_with_allow_multiple_query(request_options: {}, **params)
          _query_param_names = [
            %w[query number],
            %i[query number]
          ].flatten
          _query = params.slice(*_query_param_names)
          params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/params",
            query: _query
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # GET with path and query params
        #
        # @return [untyped]
        def get_with_path_and_query(request_options: {}, **params)
          _query_param_names = [
            ["query"],
            %i[query]
          ].flatten
          _query = params.slice(*_query_param_names)
          params = params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
            query: _query
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # GET with path and query params
        #
        # @return [untyped]
        def get_with_inline_path_and_query(request_options: {}, **params)
          _query_param_names = [
            ["query"],
            %i[query]
          ].flatten
          _query = params.slice(*_query_param_names)
          params = params.except(*_query_param_names)

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/params/path-query/#{params[:param]}",
            query: _query
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # PUT to update with path param
        #
        # @return [String]
        def modify_with_path(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PUT",
            path: "/params/path/#{params[:param]}",
            body: params
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end

        # PUT to update with path param
        #
        # @return [String]
        def modify_with_inline_path(request_options: {}, **params)
          _path_param_names = ["param"]

          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PUT",
            path: "/params/path/#{params[:param]}",
            body: params.except(*_path_param_names)
          )
          _response = @client.send(_request)
          return if _response.code >= "200" && _response.code < "300"

          raise _response.body
        end
      end
    end
  end
end
