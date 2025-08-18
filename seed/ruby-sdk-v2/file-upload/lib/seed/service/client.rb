
module Seed
    module Service
        class Client
            # @option client [Seed::Internal::Http::RawClient]
            #
            # @return [Seed::Service::Client]
            def initialize(client)
                @client = client
            end

            # @return [untyped]
            def post(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def just_file(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def just_file_with_query_params(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def with_content_type(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def with_form_encoding(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def with_form_encoded_containers(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end

            # @return [String]
            def optional_args(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
                end
            end

            # @return [String]
            def with_inline_type(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return 
                else
                    raise _response.body
                end
            end

            # @return [untyped]
            def simple(request_options: {}, **params)
                _request = params

                _response = @client.send(_request)
                if if _response.code >= "200" && _response.code < "300"
                    return
                    
                else
                    raise _response.body
                end
            end
        end
    end
end
