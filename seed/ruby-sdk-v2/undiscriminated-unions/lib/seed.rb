# frozen_string_literal: true

require "json"
require "net/http"
require "securerandom"

require_relative "seed/internal/json/serializable"
require_relative "seed/internal/types/type"
require_relative "seed/internal/types/utils"
require_relative "seed/internal/types/union"
require_relative "seed/internal/errors/constraint_error"
require_relative "seed/internal/errors/type_error"
require_relative "seed/internal/http/base_request"
require_relative "seed/internal/json/request"
require_relative "seed/internal/http/raw_client"
require_relative "seed/internal/multipart/multipart_encoder"
require_relative "seed/internal/multipart/multipart_form_data_part"
require_relative "seed/internal/multipart/multipart_form_data"
require_relative "seed/internal/multipart/multipart_request"
require_relative "seed/internal/types/model/field"
require_relative "seed/internal/types/model"
require_relative "seed/internal/types/array"
require_relative "seed/internal/types/boolean"
require_relative "seed/internal/types/enum"
require_relative "seed/internal/types/hash"
require_relative "seed/internal/types/unknown"
require_relative "seed/errors/api_error"
require_relative "seed/errors/response_error"
require_relative "seed/errors/client_error"
require_relative "seed/errors/redirect_error"
require_relative "seed/errors/server_error"
require_relative "seed/errors/timeout_error"
require_relative "seed/internal/iterators/item_iterator"
require_relative "seed/internal/iterators/cursor_item_iterator"
require_relative "seed/internal/iterators/offset_item_iterator"
require_relative "seed/internal/iterators/cursor_page_iterator"
require_relative "seed/internal/iterators/offset_page_iterator"
require_relative "seed/errors/connection_error"
require_relative "seed/client"
require_relative "seed/union/client"
require_relative "seed/union/types/payment_request"

module Seed
  module Union
    module Types
      autoload :NamedMetadata, File.join(__dir__, "seed/union/types/named_metadata")
      autoload :OptionalMetadata, File.join(__dir__, "seed/union/types/optional_metadata")
      autoload :MetadataUnion, File.join(__dir__, "seed/union/types/metadata_union")
      autoload :Request, File.join(__dir__, "seed/union/types/request")
      autoload :MyUnion, File.join(__dir__, "seed/union/types/my_union")
      autoload :TypeWithOptionalUnion, File.join(__dir__, "seed/union/types/type_with_optional_union")
      autoload :NestedUnionL2, File.join(__dir__, "seed/union/types/nested_union_l2")
      autoload :NestedUnionL1, File.join(__dir__, "seed/union/types/nested_union_l1")
      autoload :NestedUnionRoot, File.join(__dir__, "seed/union/types/nested_union_root")
      autoload :UnionWithDuplicateTypes, File.join(__dir__, "seed/union/types/union_with_duplicate_types")
      autoload :KeyType, File.join(__dir__, "seed/union/types/key_type")
      autoload :Key, File.join(__dir__, "seed/union/types/key")
      autoload :Metadata, File.join(__dir__, "seed/union/types/metadata")
      autoload :UnionWithBaseProperties, File.join(__dir__, "seed/union/types/union_with_base_properties")
      autoload :UnionWithIdenticalStrings, File.join(__dir__, "seed/union/types/union_with_identical_strings")
      autoload :UnionWithIdenticalPrimitives, File.join(__dir__, "seed/union/types/union_with_identical_primitives")
      autoload :TokenizeCard, File.join(__dir__, "seed/union/types/tokenize_card")
      autoload :ConvertToken, File.join(__dir__, "seed/union/types/convert_token")
      autoload :PaymentMethodUnion, File.join(__dir__, "seed/union/types/payment_method_union")
      autoload :UnionWithReservedNames, File.join(__dir__, "seed/union/types/union_with_reserved_names")
      autoload :UserID, File.join(__dir__, "seed/union/types/user_id")
      autoload :Name, File.join(__dir__, "seed/union/types/name")
      autoload :UnionWithTypeAliases, File.join(__dir__, "seed/union/types/union_with_type_aliases")
      autoload :LeafTypeA, File.join(__dir__, "seed/union/types/leaf_type_a")
      autoload :LeafTypeB, File.join(__dir__, "seed/union/types/leaf_type_b")
      autoload :NestedObjectUnion, File.join(__dir__, "seed/union/types/nested_object_union")
      autoload :WrapperObject, File.join(__dir__, "seed/union/types/wrapper_object")
      autoload :OuterNestedUnion, File.join(__dir__, "seed/union/types/outer_nested_union")
      autoload :LeafObjectA, File.join(__dir__, "seed/union/types/leaf_object_a")
      autoload :AliasedLeafA, File.join(__dir__, "seed/union/types/aliased_leaf_a")
      autoload :LeafObjectB, File.join(__dir__, "seed/union/types/leaf_object_b")
      autoload :AliasToLeafB, File.join(__dir__, "seed/union/types/alias_to_leaf_b")
      autoload :AliasedLeafB, File.join(__dir__, "seed/union/types/aliased_leaf_b")
      autoload :AliasedObjectUnion, File.join(__dir__, "seed/union/types/aliased_object_union")
    end
  end
end
