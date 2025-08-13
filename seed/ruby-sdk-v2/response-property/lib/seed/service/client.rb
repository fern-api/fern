
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Service::Response]
            def get_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

            # @return [Seed::Service::Response]
            def get_movie_docs(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

            # @return [Seed::StringResponse]
            def get_movie_name(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

            # @return [Seed::Service::Response]
            def get_movie_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

            # @return [Seed::Service::Response | nil]
            def get_optional_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

            # @return [Seed::Service::WithDocs | nil]
            def get_optional_movie_docs(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

            # @return [Seed::StringResponse | nil]
            def get_optional_movie_name(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

    end
end
