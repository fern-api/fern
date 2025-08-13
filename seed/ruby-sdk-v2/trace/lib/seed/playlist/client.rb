
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
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Playlist::Playlist]
            def create_playlist(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::playlist::Playlist]
            def create_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/v2/playlist/#{params[:serviceParam]}/create"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Playlist::Playlist]
            def create_playlist(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # Returns the user's playlists
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Array[Seed::Playlist::Playlist]]
            def get_playlists(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Array[Seed::playlist::Playlist]]
            def get_playlists(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/v2/playlist/#{params[:serviceParam]}/all"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Array[Seed::Playlist::Playlist]]
            def get_playlists(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # Returns a playlist
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Playlist::Playlist]
            def get_playlist(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::playlist::Playlist]
            def get_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Playlist::Playlist]
            def get_playlist(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # Updates a playlist
            #
<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Playlist::Playlist | nil]
=======
            # @return [Seed::playlist::Playlist | nil]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Playlist::Playlist | nil]
>>>>>>> 51153df442 (fix)
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
<<<<<<< HEAD
<<<<<<< HEAD
                raise NotImplementedError, 'This method is not yet implemented.'
=======
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: DELETE,
                    path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlist_id]}"
                )
>>>>>>> ca21b06d09 (fix)
=======
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

    end
end
