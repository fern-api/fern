# frozen_string_literal: true

module Seed
  module Types
    class UserOrAdminDiscriminatedAdmin < Internal::Types::Model
      field :type, -> { Seed::Types::UserOrAdminDiscriminatedAdminType }, optional: false, nullable: false
      field :admin, -> { Seed::Types::Admin }, optional: true, nullable: false
    end
  end
end
