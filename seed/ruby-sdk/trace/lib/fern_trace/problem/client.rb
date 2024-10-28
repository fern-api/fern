# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/create_problem_request"
require_relative "types/create_problem_response"
require_relative "types/update_problem_response"
require_relative "types/variable_type_and_name"
require_relative "../commons/types/variable_type"
require_relative "types/get_default_starter_files_response"
require "async"

module SeedTraceClient
  class ProblemClient
    # @return [SeedTraceClient::RequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::RequestClient]
    # @return [SeedTraceClient::ProblemClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Creates a problem
    #
    # @param request [Hash] Request of type SeedTraceClient::Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<SeedTraceClient::Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles})
    #   * :input_params (Array<SeedTraceClient::Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<SeedTraceClient::Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Problem::CreateProblemResponse]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.create_problem(request: { problem_name: "problemName", problem_description: { boards:  }, files: { JAVA: { solution_file: { filename: "filename", contents: "contents" }, read_only_files: [{ filename: "filename", contents: "contents" }, { filename: "filename", contents: "contents" }] } }, input_params: [{ name: "name" }, { name: "name" }], testcases: [{ test_case: { id: "id", params:  } }, { test_case: { id: "id", params:  } }], method_name: "methodName" })
    def create_problem(request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/create"
      end
      SeedTraceClient::Problem::CreateProblemResponse.from_json(json_object: response.body)
    end

    # Updates a problem
    #
    # @param problem_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<SeedTraceClient::Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles})
    #   * :input_params (Array<SeedTraceClient::Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<SeedTraceClient::Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Problem::UpdateProblemResponse]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.update_problem(problem_id: "problemId", request: { problem_name: "problemName", problem_description: { boards:  }, files: { JAVA: { solution_file: { filename: "filename", contents: "contents" }, read_only_files: [{ filename: "filename", contents: "contents" }, { filename: "filename", contents: "contents" }] } }, input_params: [{ name: "name" }, { name: "name" }], testcases: [{ test_case: { id: "id", params:  } }, { test_case: { id: "id", params:  } }], method_name: "methodName" })
    def update_problem(problem_id:, request:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/update/#{problem_id}"
      end
      SeedTraceClient::Problem::UpdateProblemResponse.from_json(json_object: response.body)
    end

    # Soft deletes a problem
    #
    # @param problem_id [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.delete_problem(problem_id: "problemId")
    def delete_problem(problem_id:, request_options: nil)
      @request_client.conn.delete do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        unless request_options.nil? || request_options&.additional_body_parameters.nil?
          req.body = { **(request_options&.additional_body_parameters || {}) }.compact
        end
        req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/delete/#{problem_id}"
      end
    end

    # Returns default starter files for problem
    #
    # @param input_params [Array<Hash>] Request of type Array<SeedTraceClient::Problem::VariableTypeAndName>, as a Hash
    #   * :variable_type (Hash)
    #   * :name (String)
    # @param output_type [SeedTraceClient::Commons::VariableType]
    # @param method_name [String] The name of the `method` that the student has to complete.
    #  The method name cannot include the following characters:
    #  - Greater Than `>`
    #  - Less Than `<``
    #  - Equals `=`
    #  - Period `.`
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Problem::GetDefaultStarterFilesResponse]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.get_default_starter_files(input_params: [{ name: "name" }, { name: "name" }], method_name: "methodName")
    def get_default_starter_files(input_params:, output_type:, method_name:, request_options: nil)
      response = @request_client.conn.post do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = {
      **(req.headers || {}),
      **@request_client.get_headers,
      **(request_options&.additional_headers || {})
        }.compact
        unless request_options.nil? || request_options&.additional_query_parameters.nil?
          req.params = { **(request_options&.additional_query_parameters || {}) }.compact
        end
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          inputParams: input_params,
          outputType: output_type,
          methodName: method_name
        }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/default-starter-files"
      end
      SeedTraceClient::Problem::GetDefaultStarterFilesResponse.from_json(json_object: response.body)
    end
  end

  class AsyncProblemClient
    # @return [SeedTraceClient::AsyncRequestClient]
    attr_reader :request_client

    # @param request_client [SeedTraceClient::AsyncRequestClient]
    # @return [SeedTraceClient::AsyncProblemClient]
    def initialize(request_client:)
      @request_client = request_client
    end

    # Creates a problem
    #
    # @param request [Hash] Request of type SeedTraceClient::Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<SeedTraceClient::Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles})
    #   * :input_params (Array<SeedTraceClient::Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<SeedTraceClient::Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Problem::CreateProblemResponse]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.create_problem(request: { problem_name: "problemName", problem_description: { boards:  }, files: { JAVA: { solution_file: { filename: "filename", contents: "contents" }, read_only_files: [{ filename: "filename", contents: "contents" }, { filename: "filename", contents: "contents" }] } }, input_params: [{ name: "name" }, { name: "name" }], testcases: [{ test_case: { id: "id", params:  } }, { test_case: { id: "id", params:  } }], method_name: "methodName" })
    def create_problem(request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/create"
        end
        SeedTraceClient::Problem::CreateProblemResponse.from_json(json_object: response.body)
      end
    end

    # Updates a problem
    #
    # @param problem_id [String]
    # @param request [Hash] Request of type SeedTraceClient::Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<SeedTraceClient::Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles})
    #   * :input_params (Array<SeedTraceClient::Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<SeedTraceClient::Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Problem::UpdateProblemResponse]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.update_problem(problem_id: "problemId", request: { problem_name: "problemName", problem_description: { boards:  }, files: { JAVA: { solution_file: { filename: "filename", contents: "contents" }, read_only_files: [{ filename: "filename", contents: "contents" }, { filename: "filename", contents: "contents" }] } }, input_params: [{ name: "name" }, { name: "name" }], testcases: [{ test_case: { id: "id", params:  } }, { test_case: { id: "id", params:  } }], method_name: "methodName" })
    def update_problem(problem_id:, request:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/update/#{problem_id}"
        end
        SeedTraceClient::Problem::UpdateProblemResponse.from_json(json_object: response.body)
      end
    end

    # Soft deletes a problem
    #
    # @param problem_id [String]
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [Void]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.delete_problem(problem_id: "problemId")
    def delete_problem(problem_id:, request_options: nil)
      Async do
        @request_client.conn.delete do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          unless request_options.nil? || request_options&.additional_body_parameters.nil?
            req.body = { **(request_options&.additional_body_parameters || {}) }.compact
          end
          req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/delete/#{problem_id}"
        end
      end
    end

    # Returns default starter files for problem
    #
    # @param input_params [Array<Hash>] Request of type Array<SeedTraceClient::Problem::VariableTypeAndName>, as a Hash
    #   * :variable_type (Hash)
    #   * :name (String)
    # @param output_type [SeedTraceClient::Commons::VariableType]
    # @param method_name [String] The name of the `method` that the student has to complete.
    #  The method name cannot include the following characters:
    #  - Greater Than `>`
    #  - Less Than `<``
    #  - Equals `=`
    #  - Period `.`
    # @param request_options [SeedTraceClient::RequestOptions]
    # @return [SeedTraceClient::Problem::GetDefaultStarterFilesResponse]
    # @example
    #  trace = SeedTraceClient::Client.new(
    #    base_url: "https://api.example.com",
    #    environment: SeedTraceClient::Environment::PROD,
    #    token: "YOUR_AUTH_TOKEN"
    #  )
    #  trace.problem.get_default_starter_files(input_params: [{ name: "name" }, { name: "name" }], method_name: "methodName")
    def get_default_starter_files(input_params:, output_type:, method_name:, request_options: nil)
      Async do
        response = @request_client.conn.post do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = {
        **(req.headers || {}),
        **@request_client.get_headers,
        **(request_options&.additional_headers || {})
          }.compact
          unless request_options.nil? || request_options&.additional_query_parameters.nil?
            req.params = { **(request_options&.additional_query_parameters || {}) }.compact
          end
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            inputParams: input_params,
            outputType: output_type,
            methodName: method_name
          }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/problem-crud/default-starter-files"
        end
        SeedTraceClient::Problem::GetDefaultStarterFilesResponse.from_json(json_object: response.body)
      end
    end
  end
end
