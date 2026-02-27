# @friehub/taas-interfaces

Public interfaces and core types for the FrieHub TaaS (Truth as a Service) ecosystem.

This package serves as the **contract and dictionary** for the TaaS protocol. It ensures that Truth Nodes, Sovereign Gateways, Execution Engines, and Data Plugins all communicate using the exact same structure without creating heavy internal dependencies.

## Installation

```bash
npm install @friehub/taas-interfaces
```

## Key Exports

### \`SovereignAdapter\`
The lean, stateless abstract base class for all TaaS Truth Sources (Plugins). 

If you are a builder writing a custom data adapter to connect a new API to the FrieHub gateway, you must extend this class and implement the \`fetchData\` and \`getMockData\` methods.

### \`OutcomeType\` (Enum)
Defines all mathematically possible truth outcomes in the protocol:
- \`BINARY\`: 0 or 1 (Yes/No)
- \`SCALAR\`: Any numeric value with units
- \`CATEGORICAL\`: A string mapped to a predefined list
- \`PROBABILISTIC\`: A confidence score from 0.0 to 1.0
- \`INVALID\`: Unanswerable queries

### \`Outcomes\` (Helper)
A utility object that provides typed builder methods for constructing mathematically valid Truth points easily:
```typescript
import { Outcomes } from '@friehub/taas-interfaces';

const result = Outcomes.binary(1, { confidence: 0.99 });
```

### \`DataCategory\` (Enum)
Standardized domains for data (e.g., \`CRYPTO\`, \`SPORTS\`, \`ECONOMICS\`, \`WEATHER\`).

## Security & Architecture

This package contains **no implementation logic** for gateways or execution engines. It only contains TypeScript types, Zod schemas, and abstract classes. This ensures it is completely safe for public distribution and integration into untrusted environments (like public DApps or Sentinel nodes).
