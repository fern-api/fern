# frozen_string_literal: true

module Seed
  module Auth
    module Types
      # An OAuth token response.
      class TokenResponse < Internal::Types::Model
        field :access_token, -> { String }, optional: false, nullable: false
        field :expires_in, -> { Integer }, optional: true, nullable: false
        field :refresh_token, -> { String }, optional: true, nullable: false
      end
    end
  end
end
