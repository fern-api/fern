# frozen_string_literal: true

module Seed
  module Types
    # Admin user object
    class Admin < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :email, -> { String }, optional: false, nullable: false

      field :password, -> { String }, optional: false, nullable: false

      field :profile, -> { Seed::Types::UserProfile }, optional: false, nullable: false

      field :admin_level, -> { String }, optional: false, nullable: false, api_name: "adminLevel"
    end
  end
end
