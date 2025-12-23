import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

// 1. Create the resource using the helper function instead of the 'new Resource' constructor
const appResource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'my-nestjs-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const sdk = new NodeSDK({
  resource: appResource,
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  console.log('--- OpenTelemetry Initialized (v2 stable) ---');
} catch (error) {
  console.error('Error initializing OpenTelemetry:', error);
}

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OTel SDK shut down'))
    .finally(() => process.exit(0));
});

export default sdk;
