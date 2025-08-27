# frozen_string_literal: true

module Seed
  module Users
    module Types
      class UserOptionalListPage < Internal::Types::Model
        field :data, -> { Seed::Users::Types::UserOptionalListContainer }, optional: false, nullable: false
        field :next_, -> { String }, optional: true, nullable: false
      end
    end
  end
end
