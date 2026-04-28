import Foundation

/// An alias around an alias around LeafObjectB, to exercise the alias-walk loop.
public typealias AliasedLeafB = AliasToLeafB
