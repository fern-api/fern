
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
            # @return [Seed::Playlist::Playlist]
            def create_playlist(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Playlist::Types::Playlist.load(_response.body)

                else
                    raise _response.body
            end

            # Returns the user's playlists
            #
            # @return [Array[Seed::Playlist::Playlist]]
            def get_playlists(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # Returns a playlist
            #
            # @return [Seed::Playlist::Playlist]
            def get_playlist(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Playlist::Types::Playlist.load(_response.body)

                else
                    raise _response.body
            end

            # Updates a playlist
            #
            # @return [Seed::Playlist::Playlist | nil]
            def update_playlist(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: PUT,
                    path: "/v2/playlist/#{params[:serviceParam]}/#{params[:playlistId]}"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
            end

            # Deletes a playlist
            #
            # @return [untyped]
            def delete_playlist(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

    end
end
