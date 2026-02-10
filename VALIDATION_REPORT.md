# Schema-Type Validation Report

## Status: ⚠️ **INCONSISTENCIES FOUND** (6 remaining)

The TypeScript types in `types/` have inconsistencies with the JSON schemas in `schema/`. Below are the remaining issues that need to be addressed.

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

### 2. **EnumProp - Field Name**
**Schema**: `enum: { "type": "array", "items": { "type": "string" } }`
**TypeScript**: `options: string[];`

❌ **Issue**: Schema uses `enum`, TypeScript uses `options`
✅ **Fix**: Change TypeScript to `enum: string[];`

---

### 3. **VariableStyle** - Structure Mismatch
**Schema**:
```json
{
  "id": { "type": "string", "description": "Figma variable ID" },
  "name": { "type": "string" },
  "variableName": { "type": "string" },
  "collectionName": { "type": "string" },
  "collectionId": { "type": "string" }
}
```
Required: `["id"]` only

**TypeScript**:
```typescript
{
  variable: string;      // ❌ Should be "id"
  collection?: string;   // ❌ Should be "collectionName" or "collectionId"
  mode?: string;         // ❌ Not in schema
  resolvedValue?: string | number | boolean; // ❌ Not in schema
}
```

❌ **Major Issue**: Completely different structure
✅ **Fix**: Rewrite to match schema exactly

---

### 4. **FigmaStyle** - Structure Mismatch
**Schema**:
```json
{
  "id": { "type": "string" },
  "name": { "type": "string" }
}
```
Required: `["id"]` only

**TypeScript**:
```typescript
{
  styleId: string;      // ❌ Should be "id"
  styleName: string;    // ❌ Should be "name", and optional
  styleType: 'FILL' | 'STROKE' | 'TEXT' | 'EFFECT' | 'GRID'; // ❌ Not in schema
}
```

❌ **Major Issue**: Different property names and extra field
✅ **Fix**: Change to match schema exactly

---

### 5. **Styles** - Generic Record vs Specific Properties
**Schema**: Defines 60+ specific style properties (rotation, visible, opacity, fills, etc.) with specific value types
**TypeScript**: `type Styles = Record<string, Style>` (generic)

❌ **Major Issue**: TypeScript is too loose, doesn't enforce schema's specific properties
✅ **Fix**: Define interface with all specific properties from schema

---

### 6. **BooleanProp - Missing x-platform**
**Schema**: Optional `x-platform` object with FIGMA property
**TypeScript**: No platform-specific metadata

⚠️ **Issue**: Missing optional metadata field (acceptable for basic types, but incomplete)
✅ **Fix**: Add optional `'x-platform'?: { FIGMA?: { type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT' } }`

---

## Summary

| # | Category | Issue | Fix |
|---|----------|-------|-----|
| 1 | Props | Type discriminator alignment | Update TypeScript to use `type: 'string'` with proper discriminators |
| 2 | Props | EnumProp field name | Rename `options` to `enum` in TypeScript |
| 3 | Styles | VariableStyle structure | Rewrite to match schema exactly |
| 4 | Styles | FigmaStyle property names | Change to match schema exactly |
| 5 | Styles | Styles generic vs specific | Define interface with specific properties from schema |
| 6 | Props | BooleanProp x-platform metadata | Add optional `'x-platform'` field to props |

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

