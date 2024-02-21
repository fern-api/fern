# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/create_problem_request"
require_relative "types/create_problem_response"
require_relative "../commons/types/problem_id"
require_relative "types/update_problem_response"
require_relative "types/variable_type_and_name"
require_relative "../commons/types/variable_type"
require_relative "types/get_default_starter_files_response"
require "async"

module SeedTraceClient
  class ProblemClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [ProblemClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # Creates a problem
    #
    # @param request [Hash] Request of type Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{Commons::Language => Commons::Language})
    #   * :input_params (Array<Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [RequestOptions]
    # @return [Problem::CreateProblemResponse]
    def create_problem(request:, request_options: nil)
      response = @request_client.conn.post("/problem-crud/create") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      Problem::CreateProblemResponse.from_json(json_object: response.body)
    end

    # Updates a problem
    #
    # @param problem_id [Commons::PROBLEM_ID]
    # @param request [Hash] Request of type Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{Commons::Language => Commons::Language})
    #   * :input_params (Array<Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [RequestOptions]
    # @return [Problem::UpdateProblemResponse]
    def update_problem(problem_id:, request:, request_options: nil)
      response = @request_client.conn.post("/problem-crud/update/#{problem_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      Problem::UpdateProblemResponse.from_json(json_object: response.body)
    end

    # Soft deletes a problem
    #
    # @param problem_id [Commons::PROBLEM_ID]
    # @param request_options [RequestOptions]
    # @return [Void]
    def delete_problem(problem_id:, request_options: nil)
      @request_client.conn.delete("/problem-crud/delete/#{problem_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
    end

    # Returns default starter files for problem
    #
    # @param input_params [Array<Hash>] Request of type Array<Problem::VariableTypeAndName>, as a Hash
    #   * :variable_type (Hash)
    #   * :name (String)
    # @param output_type [Commons::VariableType]
    # @param method_name [String] The name of the `method` that the student has to complete.
    #   The method name cannot include the following characters:
    #   - Greater Than `>`
    #   - Less Than `<``
    #   - Equals `=`
    #   - Period `.`
    # @param request_options [RequestOptions]
    # @return [Problem::GetDefaultStarterFilesResponse]
    def get_default_starter_files(input_params:, output_type:, method_name:, request_options: nil)
      response = @request_client.conn.post("/problem-crud/default-starter-files") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = {
          **(request_options&.additional_body_parameters || {}),
          inputParams: input_params,
          outputType: output_type,
          methodName: method_name
        }.compact
      end
      Problem::GetDefaultStarterFilesResponse.from_json(json_object: response.body)
    end
  end

  class AsyncProblemClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncProblemClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # Creates a problem
    #
    # @param request [Hash] Request of type Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{Commons::Language => Commons::Language})
    #   * :input_params (Array<Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [RequestOptions]
    # @return [Problem::CreateProblemResponse]
    def create_problem(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/problem-crud/create") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        Problem::CreateProblemResponse.from_json(json_object: response.body)
      end
    end

    # Updates a problem
    #
    # @param problem_id [Commons::PROBLEM_ID]
    # @param request [Hash] Request of type Problem::CreateProblemRequest, as a Hash
    #   * :problem_name (String)
    #   * :problem_description (Hash)
    #     * :boards (Array<Problem::ProblemDescriptionBoard>)
    #   * :files (Hash{Commons::Language => Commons::Language})
    #   * :input_params (Array<Problem::VariableTypeAndName>)
    #   * :output_type (Hash)
    #   * :testcases (Array<Commons::TestCaseWithExpectedResult>)
    #   * :method_name (String)
    # @param request_options [RequestOptions]
    # @return [Problem::UpdateProblemResponse]
    def update_problem(problem_id:, request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/problem-crud/update/#{problem_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        Problem::UpdateProblemResponse.from_json(json_object: response.body)
      end
    end

    # Soft deletes a problem
    #
    # @param problem_id [Commons::PROBLEM_ID]
    # @param request_options [RequestOptions]
    # @return [Void]
    def delete_problem(problem_id:, request_options: nil)
      Async do
        @request_client.conn.delete("/problem-crud/delete/#{problem_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
      end
    end

    # Returns default starter files for problem
    #
    # @param input_params [Array<Hash>] Request of type Array<Problem::VariableTypeAndName>, as a Hash
    #   * :variable_type (Hash)
    #   * :name (String)
    # @param output_type [Commons::VariableType]
    # @param method_name [String] The name of the `method` that the student has to complete.
    #   The method name cannot include the following characters:
    #   - Greater Than `>`
    #   - Less Than `<``
    #   - Equals `=`
    #   - Period `.`
    # @param request_options [RequestOptions]
    # @return [Problem::GetDefaultStarterFilesResponse]
    def get_default_starter_files(input_params:, output_type:, method_name:, request_options: nil)
      Async do
        response = @request_client.conn.post("/problem-crud/default-starter-files") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers["X-Random-Header"] = request_options.x_random_header unless request_options&.x_random_header.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = {
            **(request_options&.additional_body_parameters || {}),
            inputParams: input_params,
            outputType: output_type,
            methodName: method_name
          }.compact
        end
        Problem::GetDefaultStarterFilesResponse.from_json(json_object: response.body)
      end
    end
  end
end
