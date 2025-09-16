# frozen_string_literal: true

module Seed
  module Playlist
    class Client
      # @return [Seed::Playlist::Client]
      def initialize(client:)
        @client = client
      end

      # Create a new playlist
      #
      # @return [Seed::Playlist::Types::Playlist]
      def create_playlist(request_options: {}, **params)
        _path_param_names = ["serviceParam"]

        _query_param_names = [
          %w[datetime optionalDatetime],
          %i[datetime optionalDatetime]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "POST",
          path: "/v2/playlist/#{params[:serviceParam]}/create",
          query: _query,
          body: params.except(*_path_param_names)
        )
        _response = @client.send(_request)
        return Seed::Playlist::Types::Playlist.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Returns the user's playlists
      #
      # @return [Array[Seed::Playlist::Types::Playlist]]
      def get_playlists(request_options: {}, **params)
        _query_param_names = [
          %w[limit otherField multiLineDocs optionalMultipleField multipleField],
          %i[limit otherField multiLineDocs optionalMultipleField multipleField]
        ].flatten
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "GET",
          path: "/v2/playlist/#{params[:serviceParam]}/all",
          query: _query
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Returns a playlist
      #
      # @return [Seed::Playlist::Types::Playlist]
      def get_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "GET",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}"
        )
        _response = @client.send(_request)
        return Seed::Playlist::Types::Playlist.load(_response.body) if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Updates a playlist
      #
      # @return [Seed::Playlist::Types::Playlist | nil]
      def update_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "PUT",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}",
          body: params
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end

      # Deletes a playlist
      #
      # @return [untyped]
      def delete_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::Prod,
          method: "DELETE",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlist_id]}"
        )
        _response = @client.send(_request)
        return if _response.code >= "200" && _response.code < "300"

        raise _response.body
      end
    end
  end
end
