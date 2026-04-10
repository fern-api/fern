# frozen_string_literal: true

module Seed
  module User
    module Types
      class UserGetRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
