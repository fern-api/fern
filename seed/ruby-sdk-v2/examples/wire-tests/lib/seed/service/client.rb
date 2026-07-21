# frozen_string_literal: true

module Seed
  module Service
    class Client
      # @param client [Seed::Internal::Http::RawClient]
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
      # @option params [Seed::Types::Types::MovieID] :movie_id
      #
      # @example
      #   client.service.get_movie(movie_id: "movie-c06a4ad7")
      #
      # @return [Seed::Types::Types::Movie]
      def get_movie(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "GET",
          path: "/movie/#{URI.encode_uri_component(params[:movie_id].to_s)}",
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Movie.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Types::Types::Movie]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.create_movie(
      #     id: "movie-c06a4ad7",
      #     prequel: "movie-cv9b914f",
      #     title: "The Boy and the Heron",
      #     from: "Hayao Miyazaki",
      #     rating: 8,
      #     type: "movie",
      #     tag: "tag-wf9as23d",
      #     metadata: {
      #       actors: ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
      #       releaseDate: "2023-12-08",
      #       ratings: {
      #         rottenTomatoes: 97,
      #         imdb: 7.6
      #       }
      #     },
      #     revenue: 1000000
      #   )
      #
      # @return [String]
      def create_movie(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/movie",
          body: Seed::Types::Types::Movie.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::MovieID.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
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
      # @example
      #   client.service.get_metadata(
      #     shallow: false,
      #     x_api_version: "0.0.1"
      #   )
      #
      # @return [Seed::Types::Types::Metadata]
      def get_metadata(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        query_params = {}
        query_params["shallow"] = params[:shallow] if params.key?(:shallow)
        query_params["tag"] = params[:tag] if params.key?(:tag)

        headers = {}
        headers["X-API-Version"] = params[:x_api_version] if params[:x_api_version]

        request = Seed::Internal::JSON::Request.new(
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
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Metadata.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
          raise error_class.new(response.body, code: code)
        end
      end

      # @param request_options [Hash]
      # @param params [Seed::Types::Types::BigEntity]
      # @option request_options [String] :base_url
      # @option request_options [Hash{String => Object}] :additional_headers
      # @option request_options [Hash{String => Object}] :additional_query_parameters
      # @option request_options [Hash{String => Object}] :additional_body_parameters
      # @option request_options [Integer] :timeout_in_seconds
      #
      # @example
      #   client.service.create_big_entity(
      #     cast_member: {
      #       name: "name",
      #       id: "id"
      #     },
      #     extended_movie: {
      #       cast: %w[cast cast],
      #       id: "id",
      #       prequel: "prequel",
      #       title: "title",
      #       from: "from",
      #       rating: 1.1,
      #       type: "movie",
      #       tag: "tag",
      #       book: "book",
      #       metadata: {
      #         metadata: {
      #           key: "value"
      #         }
      #       },
      #       revenue: 1000000
      #     },
      #     entity: {
      #       type: "primitive",
      #       name: "name"
      #     },
      #     metadata: {},
      #     common_metadata: {
      #       id: "id",
      #       data: {
      #         data: "data"
      #       },
      #       json_string: "jsonString"
      #     },
      #     data: {},
      #     migration: {
      #       name: "name",
      #       status: "RUNNING"
      #     },
      #     test: {},
      #     node: {
      #       name: "name",
      #       nodes: [{
      #         name: "name",
      #         nodes: [{
      #           name: "name"
      #         }, {
      #           name: "name"
      #         }],
      #         trees: [{
      #           nodes: []
      #         }, {
      #           nodes: []
      #         }]
      #       }, {
      #         name: "name",
      #         nodes: [{
      #           name: "name"
      #         }, {
      #           name: "name"
      #         }],
      #         trees: [{
      #           nodes: []
      #         }, {
      #           nodes: []
      #         }]
      #       }],
      #       trees: [{
      #         nodes: [{
      #           name: "name",
      #           nodes: [],
      #           trees: []
      #         }, {
      #           name: "name",
      #           nodes: [],
      #           trees: []
      #         }]
      #       }, {
      #         nodes: [{
      #           name: "name",
      #           nodes: [],
      #           trees: []
      #         }, {
      #           name: "name",
      #           nodes: [],
      #           trees: []
      #         }]
      #       }]
      #     },
      #     directory: {
      #       name: "name",
      #       files: [{
      #         name: "name",
      #         contents: "contents"
      #       }, {
      #         name: "name",
      #         contents: "contents"
      #       }],
      #       directories: [{
      #         name: "name",
      #         files: [{
      #           name: "name",
      #           contents: "contents"
      #         }, {
      #           name: "name",
      #           contents: "contents"
      #         }],
      #         directories: [{
      #           name: "name"
      #         }, {
      #           name: "name"
      #         }]
      #       }, {
      #         name: "name",
      #         files: [{
      #           name: "name",
      #           contents: "contents"
      #         }, {
      #           name: "name",
      #           contents: "contents"
      #         }],
      #         directories: [{
      #           name: "name"
      #         }, {
      #           name: "name"
      #         }]
      #       }]
      #     },
      #     moment: {
      #       id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
      #       date: "2023-01-15",
      #       datetime: "2024-01-15T09:30:00Z"
      #     }
      #   )
      #
      # @return [Seed::Types::Types::Response]
      def create_big_entity(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/big-entity",
          body: Seed::Types::Types::BigEntity.new(params).to_h,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        if code.between?(200, 299)
          Seed::Types::Types::Response.load(response.body)
        else
          error_class = Seed::Errors::ResponseError.subclass_for_code(code)
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
      # @example
      #   client.service.refresh_token(request: {
      #     ttl: 420
      #   })
      #
      # @return [untyped]
      def refresh_token(request_options: {}, **params)
        params = Seed::Internal::Types::Utils.normalize_keys(params)
        request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url],
          method: "POST",
          path: "/refresh-token",
          body: params,
          request_options: request_options
        )
        begin
          response = @client.send(request)
        rescue Net::HTTPRequestTimeout
          raise Seed::Errors::TimeoutError
        end
        code = response.code.to_i
        return if code.between?(200, 299)

        error_class = Seed::Errors::ResponseError.subclass_for_code(code)
        raise error_class.new(response.body, code: code)
      end
    end
  end
end
