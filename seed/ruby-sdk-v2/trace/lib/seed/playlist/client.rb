
module Seed
    module Playlist
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Playlist::Client]
            def initialize(client)
                @client = client
            end

            # Create a new playlist
            #
            # @return [Seed::playlist::Playlist]
            def create_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/v2/playlist/#{params[:serviceParam]}/create"
                )
            end

            # Returns the user's playlists
            #
            # @return [Array[Seed::playlist::Playlist]]
            def get_playlists(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/v2/playlist/#{params[:serviceParam]}/all"
                )
            end

            # Returns a playlist
            #
            # @return [Seed::playlist::Playlist]
            def get_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}"
                )
            end

            # Updates a playlist
            #
            # @return [Seed::playlist::Playlist | nil]
            def update_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PUT,
                    path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}"
                )
            end

            # Deletes a playlist
            #
            # @return [untyped]
            def delete_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlist_id]}"
                )
            end

    end
end
