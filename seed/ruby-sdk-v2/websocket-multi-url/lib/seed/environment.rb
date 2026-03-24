# frozen_string_literal: true

module Seed
  class Environment
    PRODUCTION = { rest: "https://api.production.com", wss: "wss://ws.production.com" }.freeze
    STAGING = { rest: "https://api.staging.com", wss: "wss://ws.staging.com" }.freeze
  end
end
