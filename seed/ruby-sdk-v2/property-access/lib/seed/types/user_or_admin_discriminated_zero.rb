# frozen_string_literal: true

module Seed
  module Types
    class UserOrAdminDiscriminatedZero < Internal::Types::Model
      field :type, -> { Seed::Types::UserOrAdminDiscriminatedZeroType }, optional: false, nullable: false
    end
  end
end
