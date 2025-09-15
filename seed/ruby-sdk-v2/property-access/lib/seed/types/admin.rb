# frozen_string_literal: true

module Seed
  module Types
    # Admin user object
    class Admin < Internal::Types::Model
      field :admin_level, -> { String }, optional: false, nullable: false
    end
  end
end
