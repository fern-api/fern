# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class TokenResponse < Internal::Types::Model
      field :access_token, -> { String }, optional: true, nullable: false

      field :expires_in, -> { Integer }, optional: true, nullable: false
    end
  end
end
