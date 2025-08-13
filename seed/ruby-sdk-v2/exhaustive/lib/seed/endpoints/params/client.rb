
module Seed
    module Endpoints
        module Params
            class Client
                # @option client [Seed::Internal::Http::RawClient]
                #
                # @return [Seed::Endpoints::Params::Client]
                def initialize(client)
                    @client = client
                end

                # GET with path param
                #
                # @return [String]
                def get_with_path(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/params/path/#{params[:param]}"
                    )
                end

                # GET with path param
                #
                # @return [String]
                def get_with_inline_path(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/params/path/#{params[:param]}"
                    )
                end

                # GET with query param
                #
                # @return [untyped]
                def get_with_query(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/params"
                    )
                end

                # GET with multiple of same query param
                #
                # @return [untyped]
                def get_with_allow_multiple_query(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/params"
                    )
                end

                # GET with path and query params
                #
                # @return [untyped]
                def get_with_path_and_query(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/params/path-query/#{params[:param]}"
                    )
                end

                # GET with path and query params
                #
                # @return [untyped]
                def get_with_inline_path_and_query(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: GET,
                        path: "/params/path-query/#{params[:param]}"
                    )
                end

                # PUT to update with path param
                #
                # @return [String]
                def modify_with_path(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PUT,
                        path: "/params/path/#{params[:param]}"
                    )
                end

                # PUT to update with path param
                #
                # @return [String]
                def modify_with_inline_path(request_options: {}, **params)
                    _request = Seed::Internal::Http::JSONRequest.new(
                        method: PUT,
                        path: "/params/path/#{params[:param]}"
                    )
                end

        end
    end
end
