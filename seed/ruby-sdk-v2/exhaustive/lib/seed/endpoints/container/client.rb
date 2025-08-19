
module Seed
  module Endpoints
    module Container
      class Client
        # @return [Seed::Endpoints::Container::Client]
        def initialize(client:)
          @client = client
        end

        # @return [Array[String]]
        def get_and_return_list_of_primitives(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/list-of-primitives",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_list_of_objects(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/list-of-objects",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Array[String]]
        def get_and_return_set_of_primitives(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/set-of-primitives",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Array[Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_set_of_objects(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/set-of-objects",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Hash[String, String]]
        def get_and_return_map_prim_to_prim(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/map-prim-to-prim",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]]
        def get_and_return_map_of_prim_to_object(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/map-prim-to-object",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Seed::Types::Object_::Types::ObjectWithRequiredField | nil]
        def get_and_return_optional(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            method: POST,
            path: "/container/opt-objects",
            body: params[:request],
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

      end
    end
  end
end
