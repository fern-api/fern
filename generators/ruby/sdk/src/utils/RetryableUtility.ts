import { Class_, ClassReference, Import, Module_ } from "@fern-api/ruby-codegen";

export class RetryableUtility extends Class_ {
    constructor(clientName: string) {
        super({
            classReference: new ClassReference({
                name: "Retryable",
                import_: new Import({ from: "core/retryable", isExternal: false }),
                moduleBreadcrumbs: [clientName]
            }),
            includeInitializer: false,
            properties: [],
            documentation: "Utility class for retrying failed requests with exponential backoff.",
            functions: []
        });
    }

    /**
     * Returns the raw Ruby code for the Retryable module.
     * This is used to generate the retryable.rb file with custom retry logic.
     */
    public static getRetryableModuleCode(clientName: string): string {
        return `# frozen_string_literal: true

module ${clientName}
  # Utility class for retrying failed requests with exponential backoff.
  class Retryable
    INITIAL_RETRY_DELAY = 1
    MAX_RETRY_DELAY = 60
    DEFAULT_MAX_RETRIES = 2
    JITTER_FACTOR = 0.2
    RETRYABLE_STATUSES = [408, 429].freeze

    # Executes a request with retry logic.
    #
    # @param request_options [RequestOptions] The request options
    # @param max_retries [Integer] The default max retries from the client
    # @yield The block that executes the request
    # @return [Faraday::Response] The response
    def self.with_retries(request_options: nil, max_retries: nil)
      retries = request_options&.max_retries || max_retries || DEFAULT_MAX_RETRIES
      attempt = 0

      loop do
        response = yield
        attempt += 1

        if should_retry?(attempt, retries, response)
          Kernel.sleep(retry_delay(attempt, response))
        else
          return response
        end
      end
    end

    # Determines if a request should be retried.
    #
    # @param attempt [Integer] The current attempt number
    # @param retries [Integer] The maximum number of retries
    # @param response [Faraday::Response] The response
    # @return [Boolean] Whether the request should be retried
    def self.should_retry?(attempt, retries, response)
      attempt < retries && retryable_response?(response)
    end

    # Determines if a response is retryable.
    #
    # @param response [Faraday::Response] The response
    # @return [Boolean] Whether the response is retryable
    def self.retryable_response?(response)
      status = response.status
      RETRYABLE_STATUSES.include?(status) || status >= 500
    end

    # Calculates the delay before the next retry attempt.
    #
    # @param attempt [Integer] The current attempt number
    # @param response [Faraday::Response] The response
    # @return [Float] The delay in seconds
    def self.retry_delay(attempt, response)
      # Check for Retry-After header
      retry_after = response.headers["Retry-After"]
      if retry_after
        retry_after_seconds = retry_after.to_i
        return [retry_after_seconds, MAX_RETRY_DELAY].min if retry_after_seconds.positive?
      end

      # Exponential backoff with jitter
      delay = [INITIAL_RETRY_DELAY * (2**attempt), MAX_RETRY_DELAY].min
      jitter = delay * JITTER_FACTOR * rand
      delay + jitter
    end
  end
end
`;
    }
}
