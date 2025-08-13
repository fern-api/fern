
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::types::Movie]
            def get_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/movie/#{params[:movieId]}"
                )
            end

            # @return [String]
            def create_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/movie"
                )
            end

            # @return [Seed::types::Metadata]
            def get_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: GET,
                    path: "/metadata"
                )
            end

            # @return [Seed::types::Response]
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
