# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Migration < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :status, -> { FernExamples::Types::Types::MigrationStatus }, optional: false, nullable: false
      end
    end
  end
end
