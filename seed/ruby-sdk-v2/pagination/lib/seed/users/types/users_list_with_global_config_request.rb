# frozen_string_literal: true

module Seed
  module Users
    module Types
      class UsersListWithGlobalConfigRequest < Internal::Types::Model
        field :offset, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
