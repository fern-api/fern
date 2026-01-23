# frozen_string_literal: true

module FernPropertyAccess
  module Types
    # User profile object
    class UserProfile < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
      field :verification, -> { FernPropertyAccess::Types::UserProfileVerification }, optional: false, nullable: false
      field :ssn, -> { String }, optional: false, nullable: false
    end
  end
end
