# frozen_string_literal: true

require_relative "../../requests"
require_relative "../types/types/movie"
require "json"
require_relative "../types/types/metadata"
require_relative "../types/types/big_entity"
require_relative "../types/types/response"
require "async"

module SeedExamplesClient
  class ServiceClient
    # @return [SeedExamplesClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedExamplesClient::RequestClient]
    # @return [SeedExamplesClient::ServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param movie_id [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Movie]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.get_movie(movie_id: "movie-c06a4ad7")
    def get_movie(movie_id:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/movie/#{movie_id}"
      end
      SeedExamplesClient::Types::Movie.from_json(json_object: response.body)
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::Movie, as a Hash
    #   * :id (String)
    #   * :prequel (String)
    #   * :title (String)
    #   * :from (String)
    #   * :rating (Float)
    #   * :type (String)
    #   * :tag (String)
    #   * :book (String)
    #   * :metadata (Hash{String => Object})
    #   * :revenue (Long)
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [String]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.create_movie(request: { id: "movie-c06a4ad7", prequel: "movie-cv9b914f", title: "The Boy and the Heron", from: "Hayao Miyazaki", rating: 8, type: "movie", tag: "tag-wf9as23d", metadata: { "actors": ["Christian Bale","Florence Pugh","Willem Dafoe"], "releaseDate": "2023-12-08", "ratings": {"rottenTomatoes":97,"imdb":7.6} }, revenue: 1000000 })
    def create_movie(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movie"
      end
      JSON.parse(response.body)
    end

    # @param x_api_version [String]
    # @param shallow [Boolean]
    # @param tag [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Metadata]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.get_metadata(
    #    x_api_version: "0.0.1",
    #    shallow: false,
    #    tag: "development"
    #  )
    def get_metadata(x_api_version:, shallow: nil, tag: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
          **(req.headers || {}),
          **@request_client.get_headers,
          **(request_options&.additional_headers || {}),
          "X-API-Version": x_api_version
        }.compact
        req.params = { **(request_options&.additional_query_parameters || {}), "shallow": shallow, "tag": tag }.compact
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
      end
      SeedExamplesClient::Types::Metadata.from_json(json_object: response.body)
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::BigEntity, as a Hash
    #   * :cast_member (Hash)
    #   * :extended_movie (Hash)
    #     * :cast (Array<String>)
    #     * :id (String)
    #     * :prequel (String)
    #     * :title (String)
    #     * :from (String)
    #     * :rating (Float)
    #     * :type (String)
    #     * :tag (String)
    #     * :book (String)
    #     * :metadata (Hash{String => Object})
    #     * :revenue (Long)
    #   * :entity (Hash)
    #     * :type (Hash)
    #     * :name (String)
    #   * :metadata (Hash)
    #     * :extra (Hash{String => String})
    #     * :tags (Set<String>)
    #   * :common_metadata (Hash)
    #     * :id (String)
    #     * :data (Hash{String => String})
    #     * :json_string (String)
    #   * :event_info (Hash)
    #   * :data (Hash)
    #   * :migration (Hash)
    #     * :name (String)
    #     * :status (SeedExamplesClient::Types::MigrationStatus)
    #   * :exception (Hash)
    #   * :test (Hash)
    #   * :node (Hash)
    #     * :name (String)
    #     * :nodes (Array<SeedExamplesClient::Types::Node>)
    #     * :trees (Array<SeedExamplesClient::Types::Tree>)
    #   * :directory (Hash)
    #     * :name (String)
    #     * :files (Array<SeedExamplesClient::Types::File>)
    #     * :directories (Array<SeedExamplesClient::Types::Directory>)
    #   * :moment (Hash)
    #     * :id (String)
    #     * :date (Date)
    #     * :datetime (DateTime)
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Response]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.create_big_entity(request: { cast_member: { name: "name", id: "id" }, extended_movie: { cast: ["cast", "cast"] }, entity: { type: PRIMITIVE, name: "name" }, common_metadata: { id: "id", data: { "data": "data" }, json_string: "jsonString" }, migration: { name: "name", status: RUNNING }, node: { name: "name", nodes: [{ name: "name", nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }], trees: [{ nodes:  }, { nodes:  }] }, { name: "name", nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }], trees: [{ nodes:  }, { nodes:  }] }], trees: [{ nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }] }, { nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }] }] }, directory: { name: "name", files: [{ name: "name", contents: "contents" }, { name: "name", contents: "contents" }], directories: [{ name: "name", files: [{ name: "name", contents: "contents" }, { name: "name", contents: "contents" }], directories: [{ name: "name", files: , directories:  }, { name: "name", files: , directories:  }] }, { name: "name", files: [{ name: "name", contents: "contents" }, { name: "name", contents: "contents" }], directories: [{ name: "name", files: , directories:  }, { name: "name", files: , directories:  }] }] }, moment: { id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", date: Date.parse("2023-01-15"), datetime: DateTime.parse("2024-01-15T09:30:00.000Z") } })
    def create_big_entity(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/big-entity"
      end
      SeedExamplesClient::Types::Response.from_json(json_object: response.body)
    end
  end

  class AsyncServiceClient
    # @return [SeedExamplesClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedExamplesClient::AsyncRequestClient]
    # @return [SeedExamplesClient::AsyncServiceClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # @param movie_id [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Movie]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.get_movie(movie_id: "movie-c06a4ad7")
    def get_movie(movie_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/movie/#{movie_id}"
        end
        SeedExamplesClient::Types::Movie.from_json(json_object: response.body)
      end
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::Movie, as a Hash
    #   * :id (String)
    #   * :prequel (String)
    #   * :title (String)
    #   * :from (String)
    #   * :rating (Float)
    #   * :type (String)
    #   * :tag (String)
    #   * :book (String)
    #   * :metadata (Hash{String => Object})
    #   * :revenue (Long)
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [String]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.create_movie(request: { id: "movie-c06a4ad7", prequel: "movie-cv9b914f", title: "The Boy and the Heron", from: "Hayao Miyazaki", rating: 8, type: "movie", tag: "tag-wf9as23d", metadata: { "actors": ["Christian Bale","Florence Pugh","Willem Dafoe"], "releaseDate": "2023-12-08", "ratings": {"rottenTomatoes":97,"imdb":7.6} }, revenue: 1000000 })
    def create_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movie"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json
      end
    end

    # @param x_api_version [String]
    # @param shallow [Boolean]
    # @param tag [String]
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Metadata]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.get_metadata(
    #    x_api_version: "0.0.1",
    #    shallow: false,
    #    tag: "development"
    #  )
    def get_metadata(x_api_version:, shallow: nil, tag: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
            **(req.headers || {}),
            **@request_client.get_headers,
            **(request_options&.additional_headers || {}),
            "X-API-Version": x_api_version
          }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "shallow": shallow,
            "tag": tag
          }.compact
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/metadata"
        end
        SeedExamplesClient::Types::Metadata.from_json(json_object: response.body)
      end
    end

    # @param request [Hash] Request of type SeedExamplesClient::Types::BigEntity, as a Hash
    #   * :cast_member (Hash)
    #   * :extended_movie (Hash)
    #     * :cast (Array<String>)
    #     * :id (String)
    #     * :prequel (String)
    #     * :title (String)
    #     * :from (String)
    #     * :rating (Float)
    #     * :type (String)
    #     * :tag (String)
    #     * :book (String)
    #     * :metadata (Hash{String => Object})
    #     * :revenue (Long)
    #   * :entity (Hash)
    #     * :type (Hash)
    #     * :name (String)
    #   * :metadata (Hash)
    #     * :extra (Hash{String => String})
    #     * :tags (Set<String>)
    #   * :common_metadata (Hash)
    #     * :id (String)
    #     * :data (Hash{String => String})
    #     * :json_string (String)
    #   * :event_info (Hash)
    #   * :data (Hash)
    #   * :migration (Hash)
    #     * :name (String)
    #     * :status (SeedExamplesClient::Types::MigrationStatus)
    #   * :exception (Hash)
    #   * :test (Hash)
    #   * :node (Hash)
    #     * :name (String)
    #     * :nodes (Array<SeedExamplesClient::Types::Node>)
    #     * :trees (Array<SeedExamplesClient::Types::Tree>)
    #   * :directory (Hash)
    #     * :name (String)
    #     * :files (Array<SeedExamplesClient::Types::File>)
    #     * :directories (Array<SeedExamplesClient::Types::Directory>)
    #   * :moment (Hash)
    #     * :id (String)
    #     * :date (Date)
    #     * :datetime (DateTime)
    # @param request_options [SeedExamplesClient::RequestOptions]
    # @return [SeedExamplesClient::Types::Response]
    # @example
    #  examples = SeedExamplesClient::Client.new(base_url: "https://api.example.com", token: "YOUR_AUTH_TOKEN")
    #  examples.service.create_big_entity(request: { cast_member: { name: "name", id: "id" }, extended_movie: { cast: ["cast", "cast"] }, entity: { type: PRIMITIVE, name: "name" }, common_metadata: { id: "id", data: { "data": "data" }, json_string: "jsonString" }, migration: { name: "name", status: RUNNING }, node: { name: "name", nodes: [{ name: "name", nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }], trees: [{ nodes:  }, { nodes:  }] }, { name: "name", nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }], trees: [{ nodes:  }, { nodes:  }] }], trees: [{ nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }] }, { nodes: [{ name: "name", nodes: , trees:  }, { name: "name", nodes: , trees:  }] }] }, directory: { name: "name", files: [{ name: "name", contents: "contents" }, { name: "name", contents: "contents" }], directories: [{ name: "name", files: [{ name: "name", contents: "contents" }, { name: "name", contents: "contents" }], directories: [{ name: "name", files: , directories:  }, { name: "name", files: , directories:  }] }, { name: "name", files: [{ name: "name", contents: "contents" }, { name: "name", contents: "contents" }], directories: [{ name: "name", files: , directories:  }, { name: "name", files: , directories:  }] }] }, moment: { id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", date: Date.parse("2023-01-15"), datetime: DateTime.parse("2024-01-15T09:30:00.000Z") } })
    def create_big_entity(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/big-entity"
        end
        SeedExamplesClient::Types::Response.from_json(json_object: response.body)
      end
    end
  end
end
