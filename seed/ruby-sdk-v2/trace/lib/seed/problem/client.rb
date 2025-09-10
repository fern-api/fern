
module Seed
  module Problem
    class Client
      # @return [Seed::Problem::Client]
      def initialize(client:)
        @client = client
      end

      # Creates a problem
      #
      # @return [Seed::Problem::Types::CreateProblemResponse]
      def create_problem(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/problem-crud/create",
          body: Seed::Problem::Types::CreateProblemRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Problem::Types::CreateProblemResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Updates a problem
      #
      # @return [Seed::Problem::Types::UpdateProblemResponse]
      def update_problem(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/problem-crud/update/#{params[:problemId]}",
          body: Seed::Problem::Types::CreateProblemRequest.new(params).to_h,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Problem::Types::UpdateProblemResponse.load(_response.body)
        else
          raise _response.body
        end
      end

      # Soft deletes a problem
      #
      # @return [untyped]
      def delete_problem(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "DELETE",
          path: "/problem-crud/delete/#{"
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return
        else
          raise _response.body
        end
      end

      # Returns default starter files for problem
      #
      # @return [Seed::Problem::Types::GetDefaultStarterFilesResponse]
      def get_default_starter_files(request_options: {}, **params)
        _request = Seed::Internal::JSON::Request.new(
          base_url: request_options[:base_url] || Seed::Environment::SANDBOX,
          method: "POST",
          path: "/problem-crud/default-starter-files",
          body: params,
        )
        _response = @client.send(_request)
        if _response.code >= "200" && _response.code < "300"
          return Seed::Problem::Types::GetDefaultStarterFilesResponse.load(_response.body)
        else
          raise _response.body
        end
      end

    end
  end
end
