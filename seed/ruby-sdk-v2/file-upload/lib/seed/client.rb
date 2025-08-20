# frozen_string_literal: true

module Seed
  class Client
    # @return [Seed::Client]
    def initialize(base_url:)
      @raw_client = Seed::Internal::Http::RawClient.new(
        base_url: base_url,
        headers: {
<<<<<<< HEAD
          "User-Agent": "fern_file-upload/0.0.1",
          "X-Fern-Language": "Ruby"
        }
      )
    end

=======
          'User-Agent':'fern_file-upload/0.0.1',
          'X-Fern-Language':'Ruby'
        }
      )
    end
>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
    # @return [Seed::Service::Client]
    def service
      @service ||= Seed::Service::Client.new(client: @raw_client)
    end
  end
end
