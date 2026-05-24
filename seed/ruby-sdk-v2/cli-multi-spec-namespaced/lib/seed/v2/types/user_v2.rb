# frozen_string_literal: true

module Seed
  module V2
    module Types
      class UserV2 < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :profile, -> { Seed::V2::Types::UserV2Profile }, optional: false, nullable: false
      end
    end
  end
end
