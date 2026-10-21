# frozen_string_literal: true

require_relative "../.."

module Seed
  module Package
    module Types
      class BackupOverride < Internal::Types::Model
        field :model, -> { String }, optional: false, nullable: false
      end
    end
  end
end
