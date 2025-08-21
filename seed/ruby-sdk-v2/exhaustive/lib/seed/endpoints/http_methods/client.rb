
module Seed
  module Endpoints
    module HttpMethods
      class Client
        # @return [Seed::Endpoints::HttpMethods::Client]
        def initialize(client:)
          @client = client
        end

        # @return [String]
        def test_get(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "GET",
            path: "/http-methods/#{"
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return 
          else
            raise _response.body
          end
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_post(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "POST",
            path: "/http-methods",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params[:request]).to_h,
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          else
            raise _response.body
          end
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_put(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PUT",
            path: "/http-methods/#{params[:id]}",
            body: Seed::Types::Object_::Types::ObjectWithRequiredField.new(params[:request]).to_h,
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          else
            raise _response.body
          end
        end

        # @return [Seed::Types::Object_::Types::ObjectWithOptionalField]
        def test_patch(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "PATCH",
            path: "/http-methods/#{params[:id]}",
            body: Seed::Types::Object_::Types::ObjectWithOptionalField.new(params[:request]).to_h,
          )
          _response = @client.send(_request)
          if _response.code >= "200" && _response.code < "300"
            return Seed::Types::Object_::Types::ObjectWithOptionalField.load(_response.body)
          else
            raise _response.body
          end
        end

        # @return [bool]
        def test_delete(request_options: {}, **params)
          _request = Seed::Internal::JSON::Request.new(
            base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
            method: "DELETE",
            path: "/http-methods/#{"
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
