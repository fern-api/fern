# frozen_string_literal: true

module Seed
  module Types
    class UserOrAdminDiscriminatedTwo < Internal::Types::Model
      field :type, -> { Seed::Types::UserOrAdminDiscriminatedTwoType }, optional: false, nullable: false
    end
  end
end
