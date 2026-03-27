# frozen_string_literal: true

module Seed
  module Migration
    module Types
      class GetAttemptedMigrationsRequest < Internal::Types::Model
        field :admin - key - header, -> { String }, optional: false, nullable: false
      end
    end
  end
end
