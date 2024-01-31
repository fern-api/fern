# frozen_string_literal: true

require "date"
require_relative "types/playlist_create_request"
require_relative "types/playlist"
require_relative "types/playlist_id"
require_relative "types/update_playlist_request"
require "async"

module SeedTraceClient
  module Playlist
    class PlaylistClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [PlaylistClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param service_param [Integer]
      # @param datetime [DateTime]
      # @param optional_datetime [DateTime]
      # @param request [Hash] Request of type Playlist::PlaylistCreateRequest, as a Hash
      #   * :name (String)
      #   * :problems (Array<Commons::PROBLEM_ID>)
      # @param request_options [RequestOptions]
      # @return [Playlist::Playlist]
      def create_playlist(service_param:, datetime:, request:, optional_datetime: nil, request_options: nil)
        response = @request_client.conn.post("/v2/playlist/#{service_param}/create") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = {
            **request_options&.additional_query_parameters,
            "datetime": datetime,
            "optionalDatetime": optional_datetime
          }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
        Playlist::Playlist.from_json(json_object: response)
      end

      # @param service_param [Integer]
      # @param limit [Integer]
      # @param other_field [String]
      # @param multi_line_docs [String]
      # @param optional_multiple_field [String]
      # @param multiple_field [String]
      # @param request_options [RequestOptions]
      # @return [Array<Playlist::Playlist>]
      def get_playlists(service_param:, other_field:, multi_line_docs:, multiple_field:, limit: nil,
                        optional_multiple_field: nil, request_options: nil)
        response = @request_client.conn.get("/v2/playlist/#{service_param}/all") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.params = {
            **request_options&.additional_query_parameters,
            "limit": limit,
            "otherField": other_field,
            "multiLineDocs": multi_line_docs,
            "optionalMultipleField": optional_multiple_field,
            "multipleField": multiple_field
          }.compact
        end
        response.map do |v|
          v = v.to_h.to_json
          Playlist::Playlist.from_json(json_object: v)
        end
      end

      # @param service_param [Integer]
      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param request_options [RequestOptions]
      # @return [Playlist::Playlist]
      def get_playlist(service_param:, playlist_id:, request_options: nil)
        response = @request_client.conn.get("/v2/playlist/#{service_param}/#{playlist_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        Playlist::Playlist.from_json(json_object: response)
      end

      # @param service_param [Integer]
      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param request [Hash] Request of type Playlist::UpdatePlaylistRequest, as a Hash
      #   * :name (String)
      #   * :problems (Array<Commons::PROBLEM_ID>)
      # @param request_options [RequestOptions]
      # @return [Playlist::Playlist]
      def update_playlist(service_param:, playlist_id:, request: nil, request_options: nil)
        response = @request_client.conn.put("/v2/playlist/#{service_param}/#{playlist_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
        Playlist::Playlist.from_json(json_object: response)
      end

      # @param service_param [Integer]
      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param request_options [RequestOptions]
      # @return [Void]
      def delete_playlist(service_param:, playlist_id:, request_options: nil)
        @request_client.conn.delete("/v2/playlist/#{service_param}/#{playlist_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
          req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
      end
    end

    class AsyncPlaylistClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [AsyncPlaylistClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param service_param [Integer]
      # @param datetime [DateTime]
      # @param optional_datetime [DateTime]
      # @param request [Hash] Request of type Playlist::PlaylistCreateRequest, as a Hash
      #   * :name (String)
      #   * :problems (Array<Commons::PROBLEM_ID>)
      # @param request_options [RequestOptions]
      # @return [Playlist::Playlist]
      def create_playlist(service_param:, datetime:, request:, optional_datetime: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/v2/playlist/#{service_param}/create") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = {
              **request_options&.additional_query_parameters,
              "datetime": datetime,
              "optionalDatetime": optional_datetime
            }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Playlist::Playlist.from_json(json_object: response)
        end
      end

      # @param service_param [Integer]
      # @param limit [Integer]
      # @param other_field [String]
      # @param multi_line_docs [String]
      # @param optional_multiple_field [String]
      # @param multiple_field [String]
      # @param request_options [RequestOptions]
      # @return [Array<Playlist::Playlist>]
      def get_playlists(service_param:, other_field:, multi_line_docs:, multiple_field:, limit: nil,
                        optional_multiple_field: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/v2/playlist/#{service_param}/all") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.params = {
              **request_options&.additional_query_parameters,
              "limit": limit,
              "otherField": other_field,
              "multiLineDocs": multi_line_docs,
              "optionalMultipleField": optional_multiple_field,
              "multipleField": multiple_field
            }.compact
          end
          response.map do |v|
            v = v.to_h.to_json
            Playlist::Playlist.from_json(json_object: v)
          end
        end
      end

      # @param service_param [Integer]
      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param request_options [RequestOptions]
      # @return [Playlist::Playlist]
      def get_playlist(service_param:, playlist_id:, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/v2/playlist/#{service_param}/#{playlist_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Playlist::Playlist.from_json(json_object: response)
        end
      end

      # @param service_param [Integer]
      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param request [Hash] Request of type Playlist::UpdatePlaylistRequest, as a Hash
      #   * :name (String)
      #   * :problems (Array<Commons::PROBLEM_ID>)
      # @param request_options [RequestOptions]
      # @return [Playlist::Playlist]
      def update_playlist(service_param:, playlist_id:, request: nil, request_options: nil)
        Async.call do
          response = @request_client.conn.put("/v2/playlist/#{service_param}/#{playlist_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          Playlist::Playlist.from_json(json_object: response)
        end
      end

      # @param service_param [Integer]
      # @param playlist_id [Playlist::PLAYLIST_ID]
      # @param request_options [RequestOptions]
      # @return [Void]
      def delete_playlist(service_param:, playlist_id:, request_options: nil)
        Async.call do
          @request_client.conn.delete("/v2/playlist/#{service_param}/#{playlist_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token unless @request_client.token.nil?
            req.headers["X-Random-Header"] = @request_client.x_random_header unless @request_client.x_random_header.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
        end
      end
    end
  end
end
