# frozen_string_literal: true

module Seed
  module Package
    module Types
      class BackupConfig < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Package::Types::BackupOverride }, key: "OVERRIDE"

        member -> { Seed::Package::Types::BackupOverride }, key: "FALLBACK"
      end
    end
  end
end
