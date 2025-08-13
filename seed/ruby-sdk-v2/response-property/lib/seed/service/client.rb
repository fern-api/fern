
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
            # @return [Seed::Service::Response]
=======
            # @return [Seed::service::Response]
>>>>>>> ca21b06d09 (fix)
            def get_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

<<<<<<< HEAD
            # @return [Seed::Service::Response]
=======
            # @return [Seed::service::Response]
>>>>>>> ca21b06d09 (fix)
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

<<<<<<< HEAD
            # @return [Seed::Service::Response]
=======
            # @return [Seed::service::Response]
>>>>>>> ca21b06d09 (fix)
            def get_movie_metadata(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

<<<<<<< HEAD
            # @return [Seed::Service::Response | nil]
=======
            # @return [Seed::service::Response | nil]
>>>>>>> ca21b06d09 (fix)
            def get_optional_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "movie"
                )
            end

<<<<<<< HEAD
            # @return [Seed::Service::WithDocs | nil]
=======
            # @return [Seed::service::WithDocs | nil]
>>>>>>> ca21b06d09 (fix)
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
