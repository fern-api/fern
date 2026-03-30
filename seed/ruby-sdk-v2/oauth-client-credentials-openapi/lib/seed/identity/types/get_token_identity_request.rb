# frozen_string_literal: true

module Seed
  module Identity
    module Types
      class GetTokenIdentityRequest < Internal::Types::Model
        field :username, -> { String }, optional: false, nullable: false
        field :password, -> { String }, optional: false, nullable: false
      end
    end
  end
end
