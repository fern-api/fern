# frozen_string_literal: true

module Seed
  module Types
    class V2CustomFiles < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2CustomFilesZero }
      member -> { Seed::Types::V2CustomFilesType }
    end
  end
end
