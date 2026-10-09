# frozen_string_literal: true

module Seed
  module Package
    module Types
      class BackupOverride < Internal::Types::Model
        field :model, -> { String }, optional: false, nullable: false
      end
    end
  end
end
