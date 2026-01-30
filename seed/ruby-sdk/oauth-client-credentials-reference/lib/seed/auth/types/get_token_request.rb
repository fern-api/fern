# frozen_string_literal: true

module Seed
  module Auth
    module Types
      # The request body for getting an OAuth token.
      class GetTokenRequest < Internal::Types::Model
        field :client_id, -> { String }, optional: false, nullable: false
        field :client_secret, -> { String }, optional: false, nullable: false
      end
    end
  end
end
