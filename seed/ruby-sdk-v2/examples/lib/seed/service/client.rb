
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [Seed::Types::Movie]
            def get_movie(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::Types::Movie.load(_response.body)

                else
                    raise _response.body
            end

            # @return [String]
            def create_movie(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/movie"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::Types::MovieId.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Types::Metadata]
            def get_metadata(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::Types::Metadata.load(_response.body)

                else
                    raise _response.body
            end

            # @return [Seed::Types::Response]
            def create_big_entity(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/big-entity"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return Seed::Types::Types::Response.load(_response.body)

                else
                    raise _response.body
            end

            # @return [untyped]
            def refresh_token(request_options: {}, **params)
                _request = Seed::Internal::Http::JSONRequest.new(
                    method: POST,
                    path: "/refresh-token"
                )

                _response = @client.send(_request)
                if _response.code >= "200" && _response.code < "300"
                    return

                else
                    raise _response.body
            end

    end
end
