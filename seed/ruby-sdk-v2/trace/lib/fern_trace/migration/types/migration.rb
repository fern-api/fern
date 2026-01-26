# frozen_string_literal: true

module FernTrace
  module Migration
    module Types
      class Migration < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :status, -> { FernTrace::Migration::Types::MigrationStatus }, optional: false, nullable: false
      end
    end
  end
end
