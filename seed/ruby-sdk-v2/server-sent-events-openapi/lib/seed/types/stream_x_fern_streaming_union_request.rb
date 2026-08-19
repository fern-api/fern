# frozen_string_literal: true

module Seed
  module Types
    # A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from
    # UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level,
    # but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
    class StreamXFernStreamingUnionRequest < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionStreamMessageVariant }, key: "MESSAGE"

      member -> { Seed::Types::UnionStreamInterruptVariant }, key: "INTERRUPT"

      member -> { Seed::Types::UnionStreamCompactVariant }, key: "COMPACT"
    end
  end
end
