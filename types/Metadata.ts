/**
 * Represents the metadata for a component.
 *
 * @property author - The author of the component.
 * @property lastUpdated - The last update timestamp in ISO 8601 format.
 * @property generator - Information about the tool that generated this spec.
 * @property schema - Schema validation information.
 * @property source - Figma source information.
 * @property config - The model configuration used to generate this spec.
 */
import { Config } from './Config.js';

/**
 * Represents the metadata for a component.
 *
 * @property author - The author of the component.
 * @property lastUpdated - The last update timestamp in ISO 8601 format.
 * @property generator - Information about the tool that generated this spec.
 * @property schema - Schema validation information.
 * @property source - Figma source information.
 * @property config - The model configuration used to generate this spec.
 */
export type Metadata = {
  author: string;
  lastUpdated: string;
  generator: {
    url: string;
    version: number;
    name: string;
  };
  schema: {
    url: string;
    version: string;
  };
  source: {
    pageId: string;
    nodeId: string;
    nodeType: 'COMPONENT' | 'COMPONENT_SET' | 'FRAME';
  };
  config: Config;
  /**
   * Resolved license state at the time this component spec was generated.
   * Absent when no license was supplied to the generator.
   */
  license?: {
    /** The resolved license status string (e.g. 'active', 'none', 'expired'). */
    status: string;
    /** Human-readable description of the license state. */
    description: string;
  };
};
