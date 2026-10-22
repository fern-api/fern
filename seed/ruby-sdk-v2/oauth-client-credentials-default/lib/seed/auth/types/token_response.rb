# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Auth
    module Types
      # An OAuth token response.
      class TokenResponse < Internal::Types::Model
        field :access_token, -> { String }, optional: false, nullable: false

        field :expires_in, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
