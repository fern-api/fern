
module Seed
    module Endpoints
        module HttpMethods
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::HttpMethods::Client]
                def initialize(client)
                    @client = client
                end

                # @return [String]
                def test_get(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

                # @return [Seed::Types::Object_::ObjectWithOptionalField]
                def test_post(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: POST,
                        path: "/http-methods"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)

                    else
                        raise _response.body
                end

                # @return [Seed::Types::Object_::ObjectWithOptionalField]
                def test_put(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PUT,
                        path: "/http-methods/#{params[:id]}"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)

                    else
                        raise _response.body
                end

                # @return [Seed::Types::Object_::ObjectWithOptionalField]
                def test_patch(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PATCH,
                        path: "/http-methods/#{params[:id]}"
                    )

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)

                    else
                        raise _response.body
                end

                # @return [bool]
                def test_delete(request_options: {}, **params)
                    _request = params

                    _response = @client.send(_request)
                    if _response.code >= "200" && _response.code < "300"
                        return 
                    else
                        raise _response.body
                end

        end
    end
end
