# frozen_string_literal: true

module Seed
  class Environment
    PRODUCTION = { base: "https://api.example.com/2.0", auth: "https://auth.example.com/oauth2", upload: "https://upload.example.com/2.0" }.freeze
  end
end
