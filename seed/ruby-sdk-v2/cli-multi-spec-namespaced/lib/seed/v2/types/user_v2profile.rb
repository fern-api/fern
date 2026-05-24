# frozen_string_literal: true

module Seed
  module V2
    module Types
      class UserV2Profile < Internal::Types::Model
        field :email, -> { String }, optional: true, nullable: false

        field :display_name, -> { String }, optional: true, nullable: false, api_name: "displayName"
      end
    end
  end
end
