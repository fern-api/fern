# frozen_string_literal: true

module Seed
  module Users
    module Types
      class UsersGetRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
