# frozen_string_literal: true

module Seed
  module Auth
    module Types
      class GetTokenRequest < Internal::Types::Model
        field :client_id, -> { String }, optional: false, nullable: false
        field :client_secret, -> { String }, optional: false, nullable: false
        field :grant_type, -> { String }, optional: false, nullable: false
      end
    end
  end
end
