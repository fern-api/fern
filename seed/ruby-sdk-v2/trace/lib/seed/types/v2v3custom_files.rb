# frozen_string_literal: true

module Seed
  module Types
    class V2V3CustomFiles < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2V3CustomFilesZero }
      member -> { Seed::Types::V2V3CustomFilesType }
    end
  end
end
