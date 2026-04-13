# frozen_string_literal: true

module Seed
  module Types
    class Metadata < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::MetadataHTML }, key: "HTML"
      member -> { Seed::Types::MetadataMarkdown }, key: "MARKDOWN"
    end
  end
end
