# Anova UI Component Schema

This repository serves as the central hub for documentation, issue tracking, and community support for the Anova UI Component Schema and supporting plugin produced by Nathan Curtis of Directed Edges.

- [Plugin page](https://www.figma.com/community/plugin/1549454283615386215/anova) on Figma community

## About

Anova (short for "Analysis of variants") is the shared type system and JSON schema that defines the structure of UI component specifications. The schema describes the output of an "analysis of variants" — a deterministic audit of component composition, visual styling, and property configurations drawn from Figma components.

To learn more, read the [Analysis of Variants blog post](https://nathanacurtis.substack.com/p/analysis-of-variants-9e440c30b93e).

## NPM Package

The `@directededges/anova` package exports TypeScript types, JSON schema definitions, and a default configuration object.

```typescript
import type { Component, Config, AnyProp, Styles } from '@directededges/anova';
import { DEFAULT_CONFIG } from '@directededges/anova';
```

- [JSON Schema](schema/root.schema.json) — the canonical schema for component spec output
- [TypeScript Types](types/) — complete type definitions for all schema entities (`Component`, `Config`, `Styles`, `Element`, `AnyProp`, etc.)
- `DEFAULT_CONFIG` — a runtime configuration object controlling output shape (format, token resolution, variant depth, etc.)

## Architectural Decision Records

Schema changes are proposed and tracked through ADRs in the [`adr/`](adr/) directory. Each ADR documents the context, options considered, and decision for a type or schema modification.

- **[ADR Index](adr/INDEX.md)** — summary table of all Draft and Accepted ADRs
- `/anova.adr.create` — drafts a new ADR, claims the next number, and reserves it in the index
- `/anova.adr.implement` — applies the type and schema changes described in an ADR
- `/anova.adr.accept` — validates the implementation, marks the ADR as ACCEPTED, and updates the index

## Issue Tracking

### Reporting Issues
Found a bug or have a feature request? Please check if it already exists in our [Issues](../../issues) before creating a new one.

**For Bug Reports**, please include:
- Figma version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

**For Feature Requests**, please include:
- Clear description of the feature
- Use case and benefits
- Any relevant mockups or examples

## Community & Support

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Questions**: For general questions, please read docs first and then visit our [Slack community](https://join.slack.com/t/directededges-plugins/shared_invite/zt-3e3nhx1zp-4uUjRCA7y2QAEPZdVNJi6A)
- **Updates**: Watch the [plugin's Figma community page](https://www.figma.com/community/plugin/1549454283615386215/anova) for release updates

## License

This repository and the [JSON schema](schema/root.schema.json) are licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

You are free to:
- Use the schema to validate Anova plugin output
- Integrate the schema into your own tools and workflows
- Modify and distribute the schema
- Use it for commercial purposes

**Attribution Requirements:**
When using this schema, you must:
- Credit **Nathan Curtis** as the author
- Provide a link to this repository: https://github.com/DirectedEdges/anova
- Provide a link to the license: https://creativecommons.org/licenses/by/4.0/
- Indicate if you made any modifications to the schema

Example attribution:
> "This project uses the [Anova UI Component Schema](https://github.com/DirectedEdges/anova) by Nathan Curtis of Directed Edges, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."

See the [LICENSE](LICENSE) file for full terms.

---

**Disclaimer**: This is an independent project and is not officially affiliated with Figma Inc.