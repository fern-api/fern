
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

        _query_param_names = ["datetime", "optionalDatetime"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/v2/playlist/#{params[:serviceParam]}/create",
          query: _query,
          body: params.except(*_path_param_names),
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Playlist::Types::Playlist.load(_response.body)
        else
          raise _response.body
        end
      end

      # Returns the user's playlists
      #
      # @return [Array[Seed::Playlist::Types::Playlist]]
      def get_playlists(request_options: {}, **params)
        _query_param_names = ["limit", "otherField", "multiLineDocs", "optionalMultipleField", "multipleField"]
        _query = params.slice(*_query_param_names)
        params = params.except(*_query_param_names)

        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/v2/playlist/#{params[:serviceParam]}/all",
          query: _query,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # Returns a playlist
      #
      # @return [Seed::Playlist::Types::Playlist]
      def get_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "GET",
          path: "/v2/playlist/#{/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Playlist::Types::Playlist.load(_response.body)
        else
          raise _response.body
        end
      end

      # Updates a playlist
      #
      # @return [Seed::Playlist::Types::Playlist | nil]
      def update_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "PUT",
          path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}",
          body: params,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return 
        else
          raise _response.body
        end
      end

      # Deletes a playlist
      #
      # @return [untyped]
      def delete_playlist(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "DELETE",
          path: "/v2/playlist/#{/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

    end
  end
end
