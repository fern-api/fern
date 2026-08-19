# frozen_string_literal: true

module Seed
  class Environment
    PRODUCTION = { acme: "https://api.acme.com", oauth: "https://oauth.acme.com" }.freeze

    STAGING = { acme: "https://api.stage.acme.com", oauth: "https://oauth.stage.acme.com" }.freeze

    DEVELOPMENT = { acme: "https://api.dev.acme.com", oauth: "https://oauth.dev.acme.com" }.freeze
  end
end
