# frozen_string_literal: true

module Seed
  module Auth
    module Types
      # An auth token response.
      class TokenResponse < Internal::Types::Model
        field :access_token, -> { String }, optional: false, nullable: false
        field :token_type, -> { String }, optional: false, nullable: false
        field :expires_in, -> { Integer }, optional: false, nullable: false
        field :scope, -> { String }, optional: true, nullable: false
      end
    end
  end
end
