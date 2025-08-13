
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

<<<<<<< HEAD
<<<<<<< HEAD
            # @return [Seed::Types::Movie]
            def get_movie(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
=======
            # @return [Seed::types::Movie]
            def get_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/movie/#{params[:movieId]}"
                )
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Types::Movie]
            def get_movie(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
>>>>>>> 51153df442 (fix)
            end

            # @return [String]
            def create_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/movie"
                )
<<<<<<< HEAD
            end

            # @return [Seed::Types::Metadata]
            def get_metadata(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

            # @return [Seed::Types::Response]
=======
            end

            # @return [Seed::Types::Metadata]
            def get_metadata(request_options: {}, **params)
                raise NotImplementedError, 'This method is not yet implemented.'
            end

<<<<<<< HEAD
            # @return [Seed::types::Response]
>>>>>>> ca21b06d09 (fix)
=======
            # @return [Seed::Types::Response]
>>>>>>> 51153df442 (fix)
            def create_big_entity(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/big-entity"
                )
            end

            # @return [untyped]
            def refresh_token(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/refresh-token"
                )
            end

    end
end
