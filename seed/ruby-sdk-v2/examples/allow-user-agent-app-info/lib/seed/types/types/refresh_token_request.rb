# frozen_string_literal: true

module Seed
  module Types
    module Types
      class RefreshTokenRequest < Internal::Types::Model
        field :ttl, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
