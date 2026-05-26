# frozen_string_literal: true

module Seed
  module V1
    module Types
      class UserV1 < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :email, -> { String }, optional: true, nullable: false
      end
    end
  end
end
