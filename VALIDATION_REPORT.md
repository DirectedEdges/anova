# Schema-Type Validation Report

## Status: ⚠️ **INCONSISTENCIES FOUND** (1 remaining)

The TypeScript types in `types/` have inconsistencies with the JSON schemas in `schema/`. Below is the remaining issue that needs to be addressed.

---

## Critical Inconsistencies

### 1. **Props Type Definitions** - Type Field Values
**Schema**:
- BooleanProp: `type: "boolean"` ✓
- TextProp: `type: "string"` (const)
- IconProp: `type: "string"` (const)  
- EnumProp: `type: "string"` (const)
- SlotProp: `type: "slot"` ✓

**TypeScript**:
- BooleanProp: `type: 'boolean'` ✓
- TextProp: `type: 'text'` ❌
- IconProp: `type: 'icon'` ❌
- EnumProp: `type: 'enum'` ❌
- SlotProp: `type: 'slot'` ✓

❌ **Issue**: Text/Icon/Enum props use distinct type values in TypeScript but should use `type: "string"` in schema
✅ **Fix**: Update TypeScript to use `type: 'string'` with discriminator via other fields

---

### 2. **BooleanProp - Missing x-platform**
**Schema**: Optional `x-platform` object with FIGMA property
**TypeScript**: No platform-specific metadata

⚠️ **Issue**: Missing optional metadata field (acceptable for basic types, but incomplete)
✅ **Fix**: Add optional `'x-platform'?: { FIGMA?: { type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT' } }`

---

## Summary

| # | Category | Issue | Fix |
|---|----------|-------|-----|
| 1 | Props | Type discriminator alignment | Update TypeScript to use `type: 'string'` with proper discriminators |
| 2 | Props | BooleanProp x-platform metadata | Add optional `'x-platform'` field to props |

**Note on EnumProp**: The schema's `enum` field (array of strings) is semantically equivalent to TypeScript's `options: string[]`. Both represent the array of valid values. The transformer output may need updating to use the field name `enum` instead of `options` (pending separate work).

---

## Recommended Actions

### Immediate (Blocking publication):
1. ❌ Fix prop type discriminators
2. ❌ Rename EnumProp field
3. ❌ Fix VariableStyle and FigmaStyle structures
4. ❌ Define Styles as specific interface

### Enhancement (Post-MVP):
1. ⚡ Add x-platform metadata to prop definitions

---

## Next Steps

The types must match the schema exactly or runtime validation will fail and consumers will encounter type errors when working with actual data.

Remaining work:
1. Fix prop type discriminators (#1)
2. Rename enum field (#2)
3. Rewrite VariableStyle and FigmaStyle (#3, #4)
4. Define Styles interface with specific properties (#5)
5. Add x-platform metadata (#6)

