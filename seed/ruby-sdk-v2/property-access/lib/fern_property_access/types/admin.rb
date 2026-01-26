# frozen_string_literal: true

module FernPropertyAccess
  module Types
    # Admin user object
    class Admin < Internal::Types::Model
      field :admin_level, -> { String }, optional: false, nullable: false, api_name: "adminLevel"
    end
  end
end
