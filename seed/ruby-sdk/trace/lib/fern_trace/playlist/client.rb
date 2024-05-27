# frozen_string_literal: true

require_relative "../../requests"
require "date"
require_relative "types/playlist_create_request"
require_relative "types/playlist"
require "json"
require_relative "types/update_playlist_request"
require "async"

module SeedTraceClient
  class PlaylistClient
    # @return [SeedTraceClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::PlaylistClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Create a new playlist
    #
    # @param service_param [Integer]
    # @param datetime [DateTime]
    # @param optional_datetime [DateTime]
    # @param request [Hash] Request of type SeedTraceClient::Playlist::PlaylistCreateRequest, as a Hash
    #   * :name (String)
    #   * :problems (Array<String>)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Playlist::Playlist]
    def create_playlist(service_param:, datetime:, request:, optional_datetime: nil, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "datetime": datetime,
          "optionalDatetime": optional_datetime
        }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/create"
      end
      SeedTraceClient::Playlist::Playlist.from_json(json_object: response.body)
    end

    # Returns the user's playlists
    #
    # @param service_param [Integer]
    # @param limit [Integer]
    # @param other_field [String] i'm another field
    # @param multi_line_docs [String] I'm a multiline
    #  description
    # @param optional_multiple_field [String]
    # @param multiple_field [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<SeedTraceClient::Playlist::Playlist>]
    def get_playlists(service_param:, other_field:, multi_line_docs:, multiple_field:, limit: nil,
                      optional_multiple_field: nil, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.params = {
          **(request_options&.additional_query_parameters || {}),
          "limit": limit,
          "otherField": other_field,
          "multiLineDocs": multi_line_docs,
          "optionalMultipleField": optional_multiple_field,
          "multipleField": multiple_field
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/all"
      end
      parsed_json = JSON.parse(response.body)
      parsed_json&.map do |v|
        v = v.to_json
        SeedTraceClient::Playlist::Playlist.from_json(json_object: v)
      end
    end

    # Returns a playlist
    #
    # @param service_param [Integer]
    # @param playlist_id [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Playlist::Playlist]
    def get_playlist(service_param:, playlist_id:, request_options: nil)
      response = @request_client.conn.get do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/#{playlist_id}"
      end
      SeedTraceClient::Playlist::Playlist.from_json(json_object: response.body)
    end

    # Updates a playlist
    #
    # @param service_param [Integer]
    # @param playlist_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Playlist::UpdatePlaylistRequest, as a Hash
    #   * :name (String)
    #   * :problems (Array<String>)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Playlist::Playlist]
    def update_playlist(service_param:, playlist_id:, request: nil, request_options: nil)
      response = @request_client.conn.put do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/#{playlist_id}"
      end
      SeedTraceClient::Playlist::Playlist.from_json(json_object: response.body)
    end

    # Deletes a playlist
    #
    # @param service_param [Integer]
    # @param playlist_id [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    def delete_playlist(service_param:, playlist_id:, request_options: nil)
      @request_client.conn.delete do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/#{playlist_id}"
      end
    end
  end

  class AsyncPlaylistClient
    # @return [SeedTraceClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncPlaylistClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Create a new playlist
    #
    # @param service_param [Integer]
    # @param datetime [DateTime]
    # @param optional_datetime [DateTime]
    # @param request [Hash] Request of type SeedTraceClient::Playlist::PlaylistCreateRequest, as a Hash
    #   * :name (String)
    #   * :problems (Array<String>)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Playlist::Playlist]
    def create_playlist(service_param:, datetime:, request:, optional_datetime: nil, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "datetime": datetime,
            "optionalDatetime": optional_datetime
          }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/create"
        end
        SeedTraceClient::Playlist::Playlist.from_json(json_object: response.body)
      end
    end

    # Returns the user's playlists
    #
    # @param service_param [Integer]
    # @param limit [Integer]
    # @param other_field [String] i'm another field
    # @param multi_line_docs [String] I'm a multiline
    #  description
    # @param optional_multiple_field [String]
    # @param multiple_field [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Array<SeedTraceClient::Playlist::Playlist>]
    def get_playlists(service_param:, other_field:, multi_line_docs:, multiple_field:, limit: nil,
                      optional_multiple_field: nil, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.params = {
            **(request_options&.additional_query_parameters || {}),
            "limit": limit,
            "otherField": other_field,
            "multiLineDocs": multi_line_docs,
            "optionalMultipleField": optional_multiple_field,
            "multipleField": multiple_field
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/all"
        end
        parsed_json = JSON.parse(response.body)
        parsed_json&.map do |v|
          v = v.to_json
          SeedTraceClient::Playlist::Playlist.from_json(json_object: v)
        end
      end
    end

    # Returns a playlist
    #
    # @param service_param [Integer]
    # @param playlist_id [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Playlist::Playlist]
    def get_playlist(service_param:, playlist_id:, request_options: nil)
      Async do
        response = @request_client.conn.get do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/#{playlist_id}"
        end
        SeedTraceClient::Playlist::Playlist.from_json(json_object: response.body)
      end
    end

    # Updates a playlist
    #
    # @param service_param [Integer]
    # @param playlist_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Playlist::UpdatePlaylistRequest, as a Hash
    #   * :name (String)
    #   * :problems (Array<String>)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Playlist::Playlist]
    def update_playlist(service_param:, playlist_id:, request: nil, request_options: nil)
      Async do
        response = @request_client.conn.put do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/#{playlist_id}"
        end
        SeedTraceClient::Playlist::Playlist.from_json(json_object: response.body)
      end
    end

    # Deletes a playlist
    #
    # @param service_param [Integer]
    # @param playlist_id [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    def delete_playlist(service_param:, playlist_id:, request_options: nil)
      Async do
        @request_client.conn.delete do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/v2/playlist/#{service_param}/#{playlist_id}"
        end
      end
    end
  end
end
