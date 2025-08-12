
module Seed
    module Playlist
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Playlist::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::playlist::Playlist]
            def create_playlist
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Array[Seed::playlist::Playlist]]
            def get_playlists
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::playlist::Playlist]
            def get_playlist
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::playlist::Playlist | nil]
            def update_playlist
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [untyped]
            def delete_playlist
                raise NotImplementedError, 'This method is not yet implemented.'
            end
        end
    end
end
